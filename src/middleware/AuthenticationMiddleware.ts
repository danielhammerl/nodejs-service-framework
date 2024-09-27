import jwt, { JwtPayload } from 'jsonwebtoken';
import { Handler, Request } from 'express';
import { UnauthenticatedException } from '../exceptions';
import { getConfig } from '../config';
import { log } from '../logging';
import { AuthenticatedRequest } from '../types';

export const AuthenticationHandler: Handler = (req: Request, res, next) => {
  if (getConfig('security.ignoreAuthorization')) {
    next();
    return;
  }

  if (typeof req.headers?.authorization !== 'string') {
    throw new UnauthenticatedException();
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  if (!token) {
    log('debug', `Authentication failed, no jwt token exists`);
    throw new UnauthenticatedException();
  }
  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, getConfig('security.secretKey'));
  } catch {
    log('debug', `Authentication failed, jwt token exists but is not valid`);
    throw new UnauthenticatedException();
  }

  if (typeof decoded === 'string') {
    log('error', `decoded in Authentication.ts seems to be a string with value: ${decoded}`);
    throw new UnauthenticatedException();
  }

  (req as AuthenticatedRequest).permissions = decoded.permissions ?? [];
  (req as AuthenticatedRequest).userId = decoded.userId;
  next();
};
