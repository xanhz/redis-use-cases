import { Redis } from 'ioredis'
import { ConfigModule } from '../configs'
import { Connection } from './interface'

export class RedisConnection implements Connection {
  private static _instance: RedisConnection

  private _client: Redis

  constructor() {
    const configModule = ConfigModule.getInstance()
    this._client = new Redis({
      host: configModule.get<string>('REDIS_HOST', '127.0.0.1'),
      port: +configModule.get<number>('REDIS_PORT', 6379),
      username: configModule.get<string>('REDIS_USERNAME', ''),
      password: configModule.get<string>('REDIS_PASSWORD', ''),
      connectTimeout: configModule.get<number>('REDIS_CONNECTION_TIMEOUT', 5000),
      lazyConnect: true
    })
  }

  public static getInstance() {
    if (!RedisConnection._instance) {
      RedisConnection._instance = new RedisConnection()
    }
    return RedisConnection._instance
  }

  public getClient() {
    return this._client
  }

  public init() {
    return this._client.connect((error) => {
      if (error) {
        console.error(`[REDIS][ERROR]:`, error)
      } else {
        console.log(`[REDIS]: Connected`)
      }
    })
  }

  public destroy() {
    return this._client.quit()
  }
}
