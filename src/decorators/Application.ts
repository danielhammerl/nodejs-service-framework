import 'reflect-metadata';
import express from 'express';

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

import config from 'config';

import { critical, debug, error, info } from '../internalUtils/logging';
import { setConfigDefaults } from '../internal/setConfigDefaults';

// TODO Documentation
/**
 * can be applied to a class with a "main" function and call it
 * there can also be a "beforeStart" function to run initial code before startup
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function Application(): (constructor: Function) => void {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    if (typeof constructor?.prototype?.main !== 'function') {
      error("Error in Application decorator! Class must have a method 'main'");
      process.exit(1);
    }

    if (typeof constructor?.prototype?.beforeStart === 'function') {
      debug('Run before start handler ...');
      constructor.prototype.beforeStart();
    }
    debug('Starting Application ...');
    debug('Set default configuration ...');
    setConfigDefaults();

    const app = express();

    const webserverPort = config.get<number>('webserver.port');
    const webserverHost = config.get<string>('webserver.host');

    app.listen(webserverPort, webserverHost, () => {
      info(`Webserver started on ${webserverHost}:${webserverPort}`);

      constructor.prototype.main();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const tearDownApplication = async () => {};

    process.on('uncaughtException', function (err) {
      critical('Uncaught exception: ' + err.stack);
      tearDownApplication().finally(() => {
        process.exit(1);
      });
    });

    process.on('SIGINT', () => {
      tearDownApplication().finally(() => {
        process.exit(0);
      });
    });
    process.on('SIGTERM', () => {
      tearDownApplication().finally(() => {
        process.exit(0);
      });
    });
    process.on('SIGQUIT', () => {
      tearDownApplication().finally(() => {
        process.exit(0);
      });
    });
  };
}
