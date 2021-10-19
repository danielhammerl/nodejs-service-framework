import { HttpException } from '../HttpException';

export class ValidationException extends HttpException {
  constructor(err: Error) {
    super(err.message, 400);
  }
}
