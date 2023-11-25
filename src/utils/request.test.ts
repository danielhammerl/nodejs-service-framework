import { describe, expect, it } from '@jest/globals';
import { expectPermissionOneOf } from './request';
import { Permission } from '@danielhammerl/user-service-api';
import { AuthenticatedRequest } from '../types';
import { Request } from 'express';
import { UnauthenticatedException, UnauthorizedException } from '../exceptions';

describe('request', () => {
  describe('expectPermissionOneOf', () => {
    it('should return void if permission check succeeds', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.ADMIN, Permission.READ_USER],
      };
      expect(() =>
        expectPermissionOneOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).not.toThrow();
    });

    it('should throw Exception if permission check failes', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.READ_USER],
      };
      expect(() =>
        expectPermissionOneOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).toThrow(UnauthorizedException);
    });

    it('should throw Unauthenticated Excpetion if unauthenticated', () => {
      // @ts-expect-error don't want to implement this
      const request: Request = {};
      expect(() =>
        expectPermissionOneOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).toThrow(UnauthenticatedException);
    });
  });
});
