import HttpException from './HttpException';

export default class ValidationException extends HttpException {
  constructor(additionalMessage?: string) {
    super(400, `Validation Error ${additionalMessage}`);
  }
}
