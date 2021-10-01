import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { MikroORM, RequestContext } from '@mikro-orm/core';

import { _initOrm } from '../database/getORM';
import { logger } from '../logging';
import { getConfig } from '../config';

export interface ApplicationMetaData {
  mikroOrmEntities?: MikroORMOptions['entities'];
  beforeStartMethod: (app: Express) => Promise<void>;
  serviceName: string;
}
// TODO config system testen
// TODO Documentation
/**
 *
 * @param metaData
 * @constructor
 */
export const InitApplication = (metaData: ApplicationMetaData): void => {
  const useDatabase = !!getConfig('database');

  if (useDatabase) {
    logger.log('framework', 'Connecting to database ...');
    _initOrm(metaData?.mikroOrmEntities ?? [])
      .then((orm: MikroORM) => {
        logger.log('framework', 'Connecting to database ' + orm.config.getClientUrl(true));
        startApplication(orm, metaData);
      })
      .catch((e) => {
        if (e instanceof Error && e.message.startsWith('Cannot find module ')) {
          logger.log(
            'error',
            'Cannot find database driver. You have to install the driver on your own. MikroORM exception:\n' + e
          );
          return;
        } else {
          throw e;
        }
      });
  } else {
    logger.log('framework', 'No database specified');
    startApplication(null, metaData);
  }

  const tearDownApplication = async () => {
    logger.log('framework', 'Tear down application');
  };

  process.on('uncaughtException', function (err) {
    logger.log('critical', 'Uncaught exception! This may be a bug in nodejs-service-framework');
    logger.log('critical', 'Uncaught exception: ' + err.stack);
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
  logger.log('framework', 'Starting Application ...');
  logger.log('framework', 'Set default configuration ...');

  const app = express();

  const webserverPort = getConfig<number>('webserver.port');
  const webserverHost = getConfig<string>('webserver.host');

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
      logger.log('info', `Webserver started on ${webserverHost}:${webserverPort}`);
    });
  });
}
