import { Request } from 'express';
import { Permission } from '@danielhammerl/user-service-api';

export type AuthenticatedRequest = Request & {
  userId?: string;
  permissions?: Permission[];
};
