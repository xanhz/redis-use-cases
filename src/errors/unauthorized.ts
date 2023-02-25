import { HttpError } from './http-error';

export class UnauthorizedError extends HttpError {
  constructor() {
    super('Unauthorized', 401);
  }
}
