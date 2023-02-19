import { Router } from 'express'
import { BookController, UserController } from '../controllers'
import { createRateLimit } from '../middlewares'

export function initRoutes() {
	const router = Router()
	const bookController = new BookController()
  const userController = new UserController()

	router.get('/books', bookController.getBooks)
	router.get('/books/with-locker', bookController.getBooksWithLocker)
	router.get('/books/rate-limit', createRateLimit({ maxRequest: 1, second: 5 }), bookController.getBooksWithRatelimit)

  router.post('/users/login', userController.login)
  router.delete('/users/logout', userController.logout)

  return router
}
