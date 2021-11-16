import fetch, { Response } from 'node-fetch';
import { getConfig } from '../config';
import { getEnvironment } from '../utils/getEnvironment';

export interface LoggingInformation {
  message: string;
  stack?: string;
  metadata?: unknown;
}

export const logToLoggingService = async (logProps: LoggingInformation, application: string): Promise<Response> => {
  // TODO url to service discovery?
  return await fetch(
    getEnvironment() === 'test_framework'
      ? 'https://api.danielhammerl.de/logging-service/'
      : getConfig('logging.loggingServiceUrl') ?? 'http://localhost:30000/logging-service/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...logProps, application }),
    }
  );
};
