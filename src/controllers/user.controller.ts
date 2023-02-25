import { Request } from 'express';
import { Controller, Delete, Post } from '../core';
import { UnauthorizedError } from '../errors';

@Controller('users')
export class UserController {
  private users = [
    {
      id: 1,
      username: 'user01',
      password: '123',
    },
    {
      id: 2,
      username: 'user02',
      password: '123',
    },
  ];

  @Post('login')
  public login(req: Request) {
    const body = Object.assign({}, req.body);
    const user = this.users.find(user => {
      const { username, password } = user;
      return body['username'] === username && body['password'] === password;
    });
    if (!user) {
      throw new UnauthorizedError();
    }
    // @ts-ignore
    req.session['user'] = user;
    return {
      message: 'Login successfully',
    };
  }

  @Delete('logout')
  public logout(req: Request) {
    // @ts-ignore
    const user = req.session['user'];
    if (!user) {
      throw new UnauthorizedError();
    }
    return new Promise((resolve, reject) => {
      req.session.destroy(error => {
        return error ? reject(error) : resolve(void 0);
      });
    });
  }
}
