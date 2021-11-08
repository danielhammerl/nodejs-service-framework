import { Request } from 'express';
import { Permission } from './permission';

export type AuthenticatedRequest = Request & {
  id?: string;
  permissions?: Permission[];
};
