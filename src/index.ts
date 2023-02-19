import Bluebird from 'bluebird'
import createRedisStore from 'connect-redis'
import express from 'express'
import session from 'express-session'
import { initConsumers } from './consumers'
import { ConfigModule } from './configs'
import { RedisConnection } from './connections'
import { RedlockConnection } from './connections/redlock.connection'
import { initRoutes } from './routes'

async function main() {
	const configModule = ConfigModule.getInstance()

	const redisConnection = RedisConnection.getInstance()
	const redlockConnection = RedlockConnection.getInstance()

	const connections = [redisConnection, redlockConnection]

	await Bluebird.each(connections, connection => connection.init())

	const RedisStore = createRedisStore(session)
	const port = +configModule.get<number>('PORT')
	const app = express()

	app.use(
		session({
			store: new RedisStore({ client: redisConnection.getClient() }),
			secret: configModule.get<string>('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false,
				httpOnly: true,
				maxAge: +configModule.get<number>('SESSION_MAX_AGE'),
			},
		})
	)
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.use(initRoutes())

  initConsumers()

	app.listen(port, () => {
		console.log(`[APP]: App is listening on port ${port}`)
	})
}

main()
