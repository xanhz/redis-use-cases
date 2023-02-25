import { HttpError } from './http-error';

export class TooManyRequest extends HttpError {
  constructor(message = 'Too many request') {
    super(message, 429);
  }
}
