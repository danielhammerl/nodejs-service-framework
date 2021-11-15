import { ErrorRequestHandler } from 'express';
import { log } from '../logging';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    const message = err?.message ?? 'Unknown error occurred';
    const stack = err?.stack ?? '';
    const statusCode = err?.statusCode ?? 500;

    if (!statusCode || statusCode >= 500) {
      log('error', message, { stack });
    }

    res.status(statusCode || 500).json({
      error: {
        message,
      },
    });
  }
};
