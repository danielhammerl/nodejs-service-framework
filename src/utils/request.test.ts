import { describe, expect, it, jest } from '@jest/globals';
import { expectPermissionAllOf, expectPermissionOneOf } from './request';
import { Permission } from '@danielhammerl/user-service-api';
import { AuthenticatedRequest } from '../types';
import { Request } from 'express';
import { UnauthenticatedException, UnauthorizedException } from '../exceptions';

jest.mock('../config', () => ({
  getConfig: () => false,
}));

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

    it('should throw Exception if permission check fails', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.READ_USER],
      };
      expect(() =>
        expectPermissionOneOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).toThrow(UnauthorizedException);
    });

    it('should throw Unauthenticated Exception if unauthenticated', () => {
      // @ts-expect-error don't want to implement this
      const request: Request = {};
      expect(() =>
        expectPermissionOneOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).toThrow(UnauthenticatedException);
    });
  });

  describe('expectPermissionAllOf', () => {
    it('should return void if permission check succeeds', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.ADMIN, Permission.READ_USER],
      };
      expect(() => expectPermissionAllOf(request, [Permission.ADMIN, Permission.READ_USER])).not.toThrow();
    });

    it('should return void if permission check succeeds - 2', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.ADMIN, Permission.READ_USER],
      };
      expect(() => expectPermissionAllOf(request, [Permission.ADMIN])).not.toThrow();
    });

    it('should throw Exception if permission check fails', () => {
      // @ts-expect-error don't want to implement this
      const request: AuthenticatedRequest = {
        userId: 'test',
        permissions: [Permission.ADMIN],
      };
      expect(() => expectPermissionAllOf(request, [Permission.ADMIN, Permission.READ_USER])).toThrow(
        UnauthorizedException
      );
    });

    it('should throw Unauthenticated Exception if unauthenticated', () => {
      // @ts-expect-error don't want to implement this
      const request: Request = {};
      expect(() =>
        expectPermissionAllOf(request, [Permission.REGISTER_TO_PI_MONITORING_SERVER, Permission.ADMIN])
      ).toThrow(UnauthenticatedException);
    });
  });
});
