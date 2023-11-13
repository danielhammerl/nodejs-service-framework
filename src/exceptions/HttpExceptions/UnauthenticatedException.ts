import { HttpException } from '../HttpException';

export class UnauthenticatedException extends HttpException {
  constructor(message?: string) {
    super(message ?? `Unauthenticated`, 401);
  }
}
