import 'reflect-metadata';
import express from 'express';

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

import config from 'config';

import { critical, debug, error, info } from '../internalUtils/logging';
import { setApplicationConfig } from '../internal/ApplicationConfig';
import { ApplicationConfig } from '../interfaces';

// TODO Documentation
/**
 * can be applied to a class with a "main" function and call it
 * there can also be a "beforeStart" function to run initial code before startup
 * @param applicationConfig
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function Application(applicationConfig?: ApplicationConfig): (constructor: Function) => void {
  if (applicationConfig) {
    setApplicationConfig(applicationConfig);
  }

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

    const app = express();

    config.util.setModuleDefaults('webserver', {
      port: 8080,
      host: 'localhost',
    });

    app.listen(config.get('webserver.port'), config.get('webserver.host'), () => {
      info(`Webserver started on ${config.get('webserver.host')}:${config.get('webserver.port')}`);

      constructor.prototype.main();
    });

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
