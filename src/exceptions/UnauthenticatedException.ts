export class UnauthenticatedException extends Error {
  constructor() {
    super(`Unauthenticated`);
    this.statusCode = 401;
  }

  statusCode: number;
}
