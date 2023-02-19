import { Request, Response } from 'express'
import { HttpError } from '../errors'

export function handleError(error: Error, req: Request, res: Response) {
  const httpError = error instanceof HttpError ? error : new HttpError(error.message, 500)
  const { code } = httpError
  const body = httpError.toJSON()
  return res.status(code).send(body)
}
