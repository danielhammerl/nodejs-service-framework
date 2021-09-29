import jwt from 'jsonwebtoken';
import UnauthenticatedException from '../../exceptions/UnauthenticatedException';
import { NextFunction, Request, Response } from 'express';
import AuthenticatedRequest from "../AuthenticatedRequest";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (typeof req.headers?.authorization !== 'string') {
    throw new UnauthenticatedException();
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  if (!token) {
    throw new UnauthenticatedException();
  }
  let decoded;
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    decoded = jwt.verify(token, process.env['SECRET_KEY']!);
  } catch {
    throw new UnauthenticatedException();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(<any>decoded)?.userId) {
    return new UnauthenticatedException('Invalid JWT Token, userId not found');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<AuthenticatedRequest>req).userId = (<any>decoded).userId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<AuthenticatedRequest>req).permissions = (<any>decoded).permissions ?? [];
  next();
}
