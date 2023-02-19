import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { handleError } from '../middlewares'

export function Controller() {
	return function <T extends { new (...args: any[]): {} }>(Class: T) {
		return class extends Class {
			constructor(...args: any[]) {
				super(...args)
				for (const prop of Object.getOwnPropertyNames(Class.prototype)) {
					const func = Class.prototype[prop]
					if (typeof func === 'function') {
						Class.prototype[prop] = async (...args: any[]) => {
              const req = args[0] as Request
              const res = args[1] as Response
              const next = args[2] as NextFunction
              try {
								const result = await func.call(this, ...args)
                const statusCode = func['statusCode'] || StatusCodes.OK
								return res.status(statusCode).json(result)
							} catch (error) {
                return handleError(error as Error, req, res)
              }
						}
					}
				}
			}
		}
	}
}
