import jwt, { JwtPayload } from 'jsonwebtoken';
import { Handler } from 'express';
import { AuthenticatedRequest } from '../types';
import { UnauthenticatedException } from '../exceptions';
import { getConfig } from '../config';
import { log } from '../logging';

export const AuthenticationHandler: Handler = (req: AuthenticatedRequest, res, next) => {
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
    log('error', 'decoded in Authentication.ts seems to be a string with value: ' + decoded);
    throw new UnauthenticatedException();
  }

  req.permissions = decoded.permissions ?? [];
  next();
};
