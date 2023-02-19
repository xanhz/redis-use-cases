import Bluebird from 'bluebird'
import { Request } from 'express'
import { RedisConnection } from '../connections'
import { RedlockConnection } from '../connections/redlock.connection'
import { CacheInterceptor, Controller, HttpCode } from '../decorators'

@Controller()
export class BookController {
	public books: number[]

	constructor() {
		this.books = [1, 2, 3]
	}

	@CacheInterceptor({ ttlMs: 30000 })
	public async getBooks(req: Request) {
		await Bluebird.delay(2000)
		return this.books
	}

  public async getBooksWithRatelimit() {
    return this.books
  }

	public async getBooksWithLocker() {
		const redlock = RedlockConnection.getInstance().getClient()
    const resources = ['getBookWithLocker']
		const locker = await redlock.acquire(resources, 6000)
		console.log(`[BookController]: Lock acquires Time=${new Date()}`)
		try {
			await Bluebird.delay(2000)
			return this.books
		} finally {
			locker
				.release()
				.then(() => {
          console.log(`[BookController]: Release ${resources}`)
        })
				.catch(error => {
          console.error(`[BookController]: Release ${resources} fail |`, error)
        })
		}
	}

  public async publish(req: Request) {
    const redis = RedisConnection.getInstance().getClient()
    const payload = Object.assign({}, req.body)
    const rawPayload = JSON.stringify(payload)

    await redis.publish('pub-sub-redis', rawPayload)

    return {
      message: 'Published'
    }
  }
}
