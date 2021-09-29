import { log } from '../apiClients/loggingService';

export const logError = async (message: string, e?: Error): Promise<void> => {
  console.error(e);
  if (process.env.NODE_ENV === 'production') {
    console.error('Send error to logging service . . .');
    const result = await log({
      message: message,
      metadata: { name: e?.name, message: e?.message, stack: e?.stack },
    });
    if (result.ok) {
      console.log('Sending error to logging service was successfull');
    }
    if (!result.ok) {
      console.error('Sending error to logging service failed with http status code: ' + result.status);
    }
  }
};
