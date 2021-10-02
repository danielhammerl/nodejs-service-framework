import fetch, { Response } from 'node-fetch';

export interface LoggingInformation {
  message: string;
  stack?: string;
  metadata?: unknown;
}

export const logToLoggingService = async (logProps: LoggingInformation, application: string): Promise<Response> => {
  // TODO url to service discovery?
  return await fetch(
    process.env.NODE_ENV === 'TEST_FRAMEWORK'
      ? 'https://api.danielhammerl.de/logging-service/'
      : 'http://localhost:30010/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...logProps, application }),
    }
  );
};
