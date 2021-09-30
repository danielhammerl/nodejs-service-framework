import 'reflect-metadata';
import express, { Express } from 'express';
import config from 'config';

import { critical, debug, error, info } from '../internalUtils/logging';
import { setConfigDefaults } from '../internal/setConfigDefaults';
import { _initOrm } from '../utils/getORM';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { MikroORM, RequestContext } from '@mikro-orm/core';

export interface ApplicationMetaData {
  mikroOrmEntities?: MikroORMOptions['entities'];
  beforeStartMethod?: (app: Express) => Promise<void>;
}

// TODO Documentation
/**
 *
 * @param metaData
 * @constructor
 */
export const InitApplication = (metaData?: ApplicationMetaData): void => {
  function startApplication(orm: MikroORM | null) {
    debug('Starting Application ...');
    debug('Set default configuration ...');
    setConfigDefaults();

    const app = express();

    const webserverPort = config.get<number>('webserver.port');
    const webserverHost = config.get<string>('webserver.host');

    if (orm) {
      app.use((req, res, next) => {
        RequestContext.create(orm.em, next);
      });
    }

    // TODO add catch
    // TODO Make less messy
    (metaData?.beforeStartMethod ? metaData?.beforeStartMethod(app) : new Promise((resolve) => resolve)).then(() => {
      app.listen(webserverPort, webserverHost, () => {
        info(`Webserver started on ${webserverHost}:${webserverPort}`);
      });
    });
  }

  const useDatabase = config.has('database.type') && config.has('database.url');

  if (useDatabase) {
    debug('Connecting to database ...');
    if (!metaData?.mikroOrmEntities) {
      // TODO should be suppressable
      console.warn('No mikro orm entities specified');
    }
    _initOrm(metaData?.mikroOrmEntities ?? []).then((orm) => {
      startApplication(orm);
    });
  } else {
    startApplication(null);
  }

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
