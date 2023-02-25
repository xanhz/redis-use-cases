import { Request } from 'express';
import { HandlerContext, storage } from '../core';
import { LoggerService, RedisService } from '../services';

interface CacheOptions {
  prefix?: string;
  key?: string;
  ttl: number;
}

export function Cache(options: CacheOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let { ttl, prefix = 'http-cache', key = null } = options;
    const originalMethod = descriptor.value as Function;

    descriptor.value = function (...args: any[]) {
      const req = args[0] as Request;

      const { app } = storage.getStore() as HandlerContext;
      const redis = app.get(RedisService) as RedisService;
      const logger = app.get(LoggerService) as LoggerService;

      const vKey = key ?? options.key ?? `${prefix}:${req.url.slice(1)}`;

      return new Promise(async (resolve, reject) => {
        redis.get(vKey, async (error, value) => {
          if (error) {
            logger.error(`[CACHE_INTERCEPTOR][ERROR]: Cannot get key=${vKey}`, error);
          }
          if (value) {
            logger.log(`[CACHE_INTERCEPTOR]: Hit cache with key=${vKey}`);
            return resolve(JSON.parse(value));
          }
          try {
            const result = await originalMethod.apply(this, args);
            redis.set(vKey, JSON.stringify(result), 'PX', ttl, error => {
              if (error) {
                logger.error(`[CACHE_INTERCEPTOR][ERROR]: Cannot set key=${vKey}`, error);
              }
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    };
  };
}
