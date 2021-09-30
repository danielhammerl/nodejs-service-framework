import express from 'express';
import config from 'config';

import { critical, debug, error, info } from '../internalUtils/logging';
import { setConfigDefaults } from '../internal/setConfigDefaults';
import { _initOrm, getOrm } from '../utils/getORM';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { MikroORM, RequestContext } from '@mikro-orm/core';

export interface ApplicationMetaData {
  mikroOrmEntities?: MikroORMOptions['entities'];
}

// TODO Documentation
/**
 * can be applied to a class with a "main" function and call it
 * there can also be a "beforeStart" function to run initial code before startup
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function Application(metaData?: ApplicationMetaData): (constructor: Function) => void {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return async function (constructor: Function) {
    const useDatabase = config.has('database.type') && config.has('database.url');
    let orm: MikroORM | null = null;

    if (useDatabase) {
      debug('Connecting to database ...');
      if (!metaData?.mikroOrmEntities) {
        // TODO should be suppressable
        console.warn('No mikro orm entities specified');
      }
      orm = await _initOrm(metaData?.mikroOrmEntities ?? []);
    }

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

    if (useDatabase && orm) {
      app.use((req, res, next) => {
        // @ts-expect-error hää?
        RequestContext.create(orm.em, next);
      });
    }

    // TODO add catch
    new Promise(constructor.prototype.main(app)).then(() => {
      app.listen(webserverPort, webserverHost, () => {
        info(`Webserver started on ${webserverHost}:${webserverPort}`);
      });
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
