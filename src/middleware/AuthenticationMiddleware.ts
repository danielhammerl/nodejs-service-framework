import jwt, { JwtPayload } from 'jsonwebtoken';
import { Handler, Request } from 'express';
import { UnauthenticatedException } from '../exceptions';
import { getConfig } from '../config';
import { log } from '../logging';
import { AuthenticatedRequest } from '../types';

export const AuthenticationHandler: Handler = (req: Request, res, next) => {
  if (typeof req.headers?.authorization !== 'string') {
    throw new UnauthenticatedException();
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  if (!token) {
    throw new UnauthenticatedException();
  }
  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, getConfig('security.secretKey'));
  } catch {
    throw new UnauthenticatedException();
  }

  if (typeof decoded === 'string') {
    log('error', `decoded in Authentication.ts seems to be a string with value: ${decoded}`);
    throw new UnauthenticatedException();
  }

  (req as AuthenticatedRequest).permissions = decoded.permissions ?? [];
  (req as AuthenticatedRequest).userId = decoded.userid;
  next();
};
