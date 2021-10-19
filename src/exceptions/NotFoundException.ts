export class NotFoundException extends Error {
  constructor() {
    super(`Not found`);
    this.statusCode = 404;
  }

  statusCode: number;
}
