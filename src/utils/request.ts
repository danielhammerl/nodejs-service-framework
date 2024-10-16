import { Permission } from '@danielhammerl/user-service-api';
import { Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { UnauthenticatedException, UnauthorizedException, ValidationException } from '../exceptions';
import * as yup from 'yup';
import { getConfig } from '../config';

export const isAuthenticated = (req: Request): req is AuthenticatedRequest => {
  return getConfig('security.ignoreAuthorization') || ('userId' in req && 'permissions' in req);
};

export const expectIsAuthenticated = (req: Request): void | never => {
  if (getConfig('security.ignoreAuthorization')) {
    return;
  }

  if (!isAuthenticated(req)) {
    throw new UnauthenticatedException();
  }

  return;
};

export const expectPermissionOneOf = (req: Request, permissions: Permission[]): void | never => {
  if (getConfig('security.ignoreAuthorization')) {
    return;
  }

  expectIsAuthenticated(req);

  if (!(req as AuthenticatedRequest).permissions.some((element) => permissions.includes(element))) {
    throw new UnauthorizedException(`Dont have one of required permission: ${permissions.toString()}`);
  }

  return;
};

export const expectPermissionAllOf = (req: Request, permissions: Permission[]): void | never => {
  if (getConfig('security.ignoreAuthorization')) {
    return;
  }

  expectIsAuthenticated(req);

  if (!permissions.every((element) => (req as AuthenticatedRequest).permissions.includes(element))) {
    throw new UnauthorizedException(`Dont have all of required permission: ${permissions.toString()}`);
  }

  return;
};

export const expectRequestBodyIsValid = (requestBody: Record<string, unknown>, schema: yup.Schema): void | never => {
  try {
    schema.validateSync(requestBody);
  } catch (e) {
    throw new ValidationException(e as Error);
  }
};
