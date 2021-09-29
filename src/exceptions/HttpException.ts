export default class HttpException extends Error {
  message: string;
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
