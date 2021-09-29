import fetch from 'node-fetch';

export interface LoggingInformation {
  message: string;
  stacktrace?: string;
  metadata?: Record<string, string | undefined>;
}

export const log = async (logProps: LoggingInformation): Promise<{ ok: boolean; status?: number }> => {
  try {
    const response = await fetch('http://localhost:30010/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...logProps, application: 'Notify me service' }),
    });
    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  }
};
