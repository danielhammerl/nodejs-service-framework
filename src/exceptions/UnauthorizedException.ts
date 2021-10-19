export class UnauthorizedException extends Error {
  constructor() {
    super(`Unauthorized`);
    this.statusCode = 403;
  }

  statusCode: number;
}
