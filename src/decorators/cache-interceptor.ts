import { Request, Response } from 'express'
import { RedisConnection } from '../connections'

interface CacheOptions {
  ttlMs: number
}

export function CacheInterceptor(options: CacheOptions) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const { ttlMs } = options
    const redis = RedisConnection.getInstance().getClient()
    const originalMethod = descriptor.value as Function

    descriptor.value = function(...args: any[]) {
      const req = args[0] as Request
      const res = args[1] as Response
      const { url: cacheKey } = req

      return new Promise(async (resolve, reject) => {
        redis.get(cacheKey, async (error, cachedResult) => {
          if (error) {
            console.error(`[CACHE_INTERCEPTOR][ERROR]: Cannot get key=${cacheKey} |`, error)
          }
          if (cachedResult) {
            console.log(`[CACHE_INTERCEPTOR]: Hit cache with key=${cacheKey}`)
            return resolve(JSON.parse(cachedResult))
          }
          try {
            const result = await originalMethod.apply(this, args)
            redis.set(cacheKey, JSON.stringify(result), 'PX', ttlMs, (error) => {
              if (error) {
                console.error(`[CACHE_INTERCEPTOR][ERROR]: Cannot set key=${cacheKey} |`, error)
              }
            })
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
      })
    }
  }
}
