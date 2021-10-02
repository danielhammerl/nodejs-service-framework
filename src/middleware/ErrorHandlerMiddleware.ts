import { ErrorRequestHandler } from 'express';
import { logger } from '../logging';

// eslint-disable-next-line no-unused-vars
const ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    const message = err?.message ?? 'Unknown error occurred';
    const stack = err?.stack ?? '';
    const statusCode = err?.statusCode ?? 500;

    if (!statusCode || statusCode >= 500) {
      // TODO log to own server
      logger.log('error', message);
      logger.log('error', stack);
    }

    res.status(statusCode || 500).json({
      error: {
        message,
      },
    });
  }
};

export default ErrorHandler;
