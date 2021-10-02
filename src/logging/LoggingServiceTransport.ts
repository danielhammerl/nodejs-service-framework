import Transport from 'winston-transport';
import { logToLoggingService } from '../apiClients/loggingService';

export class LoggingServiceTransport extends Transport {
  constructor(applicationName: string, opts: Transport.TransportStreamOptions) {
    super(opts);
    this.applicationName = applicationName;
  }

  applicationName: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  log(info: any, callback: () => void): any {
    setImmediate(() => {
      this.emit('logged', info);
    });

    logToLoggingService({ message: info.message, stack: info.stack, metadata: info.metadata }, this.applicationName)
      .then((result) => {
        if (!result.ok) {
          // eslint-disable-next-line no-console
          console.error('Cannot log to logging service');
          // eslint-disable-next-line no-console
          console.error('It answered with the following status code: ', result.status);
          // eslint-disable-next-line no-console
          console.error('This dont seem to be good ...');
        } else if (process.env.NODE_ENV === 'TEST_FRAMEWORK') {
          // eslint-disable-next-line no-console
          console.log('Sent logging entry to logging service');
        }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Cannot log to logging service');
        // eslint-disable-next-line no-console
        console.error('The error is the following: ', e);
        // eslint-disable-next-line no-console
        console.error('This dont seem to be good ...');
      });
    // Perform the writing to the remote service
    callback();
  }
}
