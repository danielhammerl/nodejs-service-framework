import jwt from 'jsonwebtoken';
import { Handler, Request } from 'express';
import { getConfig } from '../config';
import { AuthenticatedRequest } from '../types';

export const AuthenticationMiddleware: Handler = (req: Request, res, next) => {
  if (typeof req.headers?.authorization !== 'string') {
    next();
    return;
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, getConfig('security.secretKey'));
    if (typeof decoded === 'string') {
      next();
      return;
    }

    (req as AuthenticatedRequest).permissions = decoded.permissions ?? [];
    (req as AuthenticatedRequest).userId = decoded.userId;

    next();
  } catch {
    next();
  }
};
