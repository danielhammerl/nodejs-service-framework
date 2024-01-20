import { Permission } from '@danielhammerl/user-service-api';
import { Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { UnauthenticatedException, UnauthorizedException } from '../exceptions';

export const isAuthenticated = (req: Request): req is AuthenticatedRequest => {
  return 'userId' in req && 'permissions' in req;
};

export const expectPermissionOneOf = (req: Request, permissions: Permission[]): void | never => {
  if (!isAuthenticated(req)) {
    throw new UnauthenticatedException();
  }

  if (!req.permissions.some((element) => permissions.includes(element))) {
    throw new UnauthorizedException(`Dont have one of required permission: ${permissions.toString()}`);
  }

  return;
};

export const expectPermissionAllOf = (req: Request, permissions: Permission[]): void | never => {
  if (!isAuthenticated(req)) {
    throw new UnauthenticatedException();
  }

  if (!req.permissions.every((element) => permissions.includes(element))) {
    throw new UnauthorizedException(`Dont have all of required permission: ${permissions.toString()}`);
  }

  return;
};
