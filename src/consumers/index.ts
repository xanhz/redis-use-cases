import { RedisConnection } from '../connections'
import { Redis } from 'ioredis'
import { logMessage } from './callbacks'

type Callback = (payload: any) => any

class ConsumerManager {
  protected redis: Redis
  protected mapCallback: Map<string, Callback>

  constructor(redis: Redis) {
    this.redis = redis
    this.mapCallback = new Map()
    this.redis.on('message', (channel, message) => {
      const payload = JSON.parse(message)
      const callback = this.mapCallback.get(channel)
      if (callback) {
        callback(payload)
      }
    })    
  }

	public subscribe(channel: string, callback: Callback) {
    this.mapCallback.set(channel, callback)
    return this.redis.subscribe(channel)
  }
}


export function initConsumers() {
  const redis = RedisConnection.getInstance().cloneClient()
  const consumerManager = new ConsumerManager(redis)
  consumerManager.subscribe('pub-sub-redis', logMessage)
}
