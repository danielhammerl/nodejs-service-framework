import { getConfig } from '../config';
import { getEnvironment } from '../utils/getEnvironment';

export interface LoggingInformation {
  message: string;
  stack?: string;
  metadata?: unknown;
}

export const logToLoggingService = (logProps: LoggingInformation, application: string): Promise<Response> => {
  // TODO url to service discovery?
  return fetch(
    getEnvironment() === 'test_framework'
      ? 'https://api.danielhammerl.de/logging-service/'
      : getConfig('logging.loggingServiceUrl') ?? 'http://127.0.0.1:30000/logging-service/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...logProps, application }),
    }
  );
};
