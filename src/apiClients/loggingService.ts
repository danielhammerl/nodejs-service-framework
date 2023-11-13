import { getConfig } from '../config';
import { SERVICE_REGISTRY_URL } from '../constants/infrastructure';

export interface LoggingInformation {
  message: string;
  stack?: string;
  metadata?: unknown;
}

export const logToLoggingService = (logProps: LoggingInformation, application: string): Promise<Response> => {
  // TODO url to service discovery?
  return fetch(getConfig('logging.loggingServiceUrl') ?? `${SERVICE_REGISTRY_URL}/logging-service/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...logProps, application }),
  });
};
