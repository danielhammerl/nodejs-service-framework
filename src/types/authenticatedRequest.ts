import { Request } from 'express';
import { Permission } from './permission';

export type AuthenticatedRequest = Request & {
  userId: string;
  permissions: Permission[];
};
