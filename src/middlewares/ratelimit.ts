import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { RedisConnection } from '../connections'

interface RateLimitOptions {
	second: number
	maxRequest: number
}

export function createRateLimit(options: RateLimitOptions) {
  const { maxRequest, second } = options
	const client = RedisConnection.getInstance().getClient()
	const redisStore = new RedisStore({
		// @ts-expect-error
		sendCommand: (...args: string[]) => client.call(...args),
	})
	return rateLimit({
		windowMs: second * 1000,
		max: maxRequest,
		standardHeaders: true,
		legacyHeaders: true,
		store: redisStore,
	})
}
