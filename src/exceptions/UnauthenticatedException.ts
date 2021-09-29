import HttpException from './HttpException';

export default class UnauthenticatedException extends HttpException {
  constructor(additionalMessage?: string) {
    super(401, `Unauthenticated ${additionalMessage || ''}`);
  }
}
