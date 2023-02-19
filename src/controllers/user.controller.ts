import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Controller, HttpCode } from '../decorators'
import { UnauthorizedError } from '../errors'

@Controller()
export class UserController {
  private _whitelistUsers = [
    {
      id: 1,
      username: 'user01',
      password: '123'
    },
    {
      id: 2,
      username: 'user02',
      password: '123'
    }
  ]

	public login(req: Request) {
		const body = Object.assign({}, req.body)
    const user = this._whitelistUsers.find(_ => {
      const { username, password } = _
      return body['username'] === username && body['password'] === password
    })
    if (!user) {
      throw new UnauthorizedError()
    }
    // @ts-ignore
    req.session['user'] = user
    return {
      message: 'Login successfully'
    }
	}

  @HttpCode(StatusCodes.NO_CONTENT)
	public logout(req: Request) {
    // @ts-ignore
    const user = req.session['user']
    if (!user) {
      throw new UnauthorizedError()
    }
    return new Promise((resolve, reject) => {
      req.session.destroy(error => {
        return error ? reject(error) : resolve(void 0)
      })
    })
  }
}
