import { StatusCodes } from 'http-status-codes'

export class HttpError extends Error {
	public readonly code: number
	protected error: any

	constructor(error: any, code?: number) {
		super()
		this.error = error
		this.code = code || StatusCodes.INTERNAL_SERVER_ERROR
	}

	toJSON() {
		return {
			code: this.code,
			error_detail: this.error,
		}
	}
}
