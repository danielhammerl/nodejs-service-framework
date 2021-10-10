import { Request } from 'express';
import { Permission } from './permission';

export type AuthenticatedRequest = Request & {
  permissions?: Permission[];
};
