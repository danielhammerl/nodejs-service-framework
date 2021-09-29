import HttpException from './HttpException';

export default class UnauthorizedException extends HttpException {
  constructor(additionalMessage?: string) {
    super(403, `Unauthorized ${additionalMessage}`);
  }
}
