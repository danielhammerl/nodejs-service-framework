import { NextFunction, Request, Response } from 'express';
import HttpException from '../../exceptions/HttpException';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ErrorHandler(err: HttpException, req: Request, res: Response, next: NextFunction): void {
  if (err) {
    const { status, message } = err;

    if (status >= 500) {
      console.error('HTTP Status ' + status + err.stack);
    }

    res.status(status || 500).json({
      error: {
        message,
      },
    });
  }
}
