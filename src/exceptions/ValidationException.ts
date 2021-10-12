export default class ValidationException extends Error {
  constructor(err: Error) {
    super(err.message);
    this.statusCode = 400;
  }

  statusCode: number;
}
