import Redlock from 'redlock'
import { Connection } from './interface'
import { Redis } from 'ioredis'
import { ConfigModule } from '../configs'

export class RedlockConnection implements Connection {
	private static _instance: RedlockConnection

	private _client!: Redlock

	constructor() {}

  public static getInstance() {
    if (!RedlockConnection._instance) {
      RedlockConnection._instance = new RedlockConnection()
    }
    return RedlockConnection._instance
  }

  public getClient() {
    return this._client
  }

	public async init() {
    const configModule = ConfigModule.getInstance()
    const redis = new Redis({
      host: configModule.get<string>('REDIS_HOST', '127.0.0.1'),
      port: +configModule.get<number>('REDIS_PORT', 6379),
      username: configModule.get<string>('REDIS_USERNAME', ''),
      password: configModule.get<string>('REDIS_PASSWORD', ''),
      connectTimeout: configModule.get<number>('REDIS_CONNECTION_TIMEOUT', 5000),
      lazyConnect: true
    })
    await redis.connect()
    // @ts-ignore
		this._client = new Redlock([redis], {
			// The expected clock drift; for more details see:
			// http://redis.io/topics/distlock
			driftFactor: 0.01, // multiplied by lock ttl to determine drift time

			// The max number of times Redlock will attempt to lock a resource
			// before erroring.
			retryCount: 10,

			// the time in ms between attempts
			retryDelay: 200, // time in ms

			// the max time in ms randomly added to retries
			// to improve performance under high contention
			// see https://www.awsarchitectureblog.com/2015/03/backoff.html
			retryJitter: 200, // time in ms

			// The minimum remaining time on a lock before an extension is automatically
			// attempted with the `using` API.
			automaticExtensionThreshold: 500, // time in ms
		})
    console.log(`[REDLOCK]: Connected`)
	}

	public async destroy() {
		return this._client.quit()
	}
}
