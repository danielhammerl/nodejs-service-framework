process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

import express, { Express } from 'express';
import config from 'config';
import bodyParser from 'body-parser';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { MikroORM, RequestContext } from '@mikro-orm/core';

import { critical, debug, info, warn } from '../internalUtils/logging';
import { setConfigDefaults } from '../internal/setConfigDefaults';
import { _initOrm } from '../utils/getORM';

export interface ApplicationMetaData {
  mikroOrmEntities?: MikroORMOptions['entities'];
  beforeStartMethod: (app: Express) => Promise<void>;
  serviceName: string;
}

// TODO Documentation
/**
 *
 * @param metaData
 * @constructor
 */
export const InitApplication = (metaData: ApplicationMetaData): void => {
  const useDatabase = config.has('database.type') && config.has('database.url');

  if (useDatabase) {
    debug('Connecting to database ...');
    _initOrm(metaData?.mikroOrmEntities ?? []).then((orm) => {
      startApplication(orm, metaData);
    });
  } else {
    startApplication(null, metaData);
  }

  const tearDownApplication = async () => {
    info('Tear down application');
  };

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

function startApplication(orm: MikroORM | null, metaData: ApplicationMetaData) {
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

  app.use(bodyParser.json());
  app.use(express.json());

  app.get('/health', (req, res) => res.status(200).send(metaData.serviceName));

  // TODO add catch
  metaData?.beforeStartMethod(app).then(() => {
    app.listen(webserverPort, webserverHost, () => {
      info(`Webserver started on ${webserverHost}:${webserverPort}`);
    });
  });
}
