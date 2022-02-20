import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { paramCase } from 'change-case';

import { _initOrm } from '../database/getORM';
import { initLogging, log } from '../logging';
import { getConfig } from '../config';
import { ErrorHandler } from '../middleware/ErrorHandlerMiddleware';
import { setServiceName } from '../internal/serviceName';
import { getFreePortFromConfig } from '../utils/getFreePortFromConfig';
import { connectToServiceRegistry } from '../apiClients/serviceRegistry';
import { getEnvironment } from '../utils/getEnvironment';

export interface ApplicationMetaData {
  mikroOrmEntities?: MikroORMOptions['entities'];
  beforeStartMethod: (app: Express) => Promise<void>;
  serviceName: string;
  exitHandler?: () => Promise<void>;
  connectToServiceRegistry?: boolean;
  hasHealthEndpoint?: boolean;
}

// TODO config system testen
// TODO Documentation
/**
 *
 * @param metaData
 * @constructor
 */
export const InitApplication = (metaData: ApplicationMetaData): void => {
  process.title = paramCase(metaData.serviceName);

  setServiceName(metaData.serviceName);
  initLogging();

  const exitHandler = (exitCode: number) => {
    log('framework', 'Shutdown application');
    process.exit(exitCode);
  };

  const useDatabase = !!getConfig('database');

  if (useDatabase) {
    log('framework', 'Connecting to database ...');
    _initOrm(metaData?.mikroOrmEntities ?? [])
      .then((orm: MikroORM) => {
        log('framework', `Connecting to database ${orm.config.getClientUrl(true)}`);
        startApplication(orm, metaData);
      })
      .catch((e) => {
        if (e instanceof Error && e.message.startsWith('Cannot find module ')) {
          log(
            'error',
            `Cannot find database driver. You have to install the driver on your own. MikroORM exception:\n${e}`
          );
          return;
        } else {
          throw e;
        }
      });
  } else {
    log('framework', 'No database specified');
    startApplication(null, metaData);
  }

  // TODO handle exception in express when port is already in use
  process.on('uncaughtException', function (err) {
    log('critical', 'Uncaught exception! This may be a bug in nodejs-service-framework', err);
  });

  process.on('SIGINT', () => {
    exitHandler(0);
  });
  process.on('SIGTERM', () => {
    exitHandler(0);
  });
  process.on('SIGQUIT', () => {
    exitHandler(0);
  });
};

async function startApplication(orm: MikroORM | null, metaData: ApplicationMetaData) {
  if (orm) {
    log('framework', `Check database against model specifications`);
    const generator = orm.getSchemaGenerator();
    const updateDump = await generator.getUpdateSchemaSQL({
      wrap: false,
      safe: true,
      dropTables: false,
      dropDb: false,
    });

    if (getEnvironment() === 'test_framework') {
      log('debug', `updateDump:${updateDump}`);
    }

    if (updateDump.trim().length > 0) {
      log('info', `Differences between database and models found: `);
      log('framework', updateDump);

      await generator.updateSchema();
      log('info', `Differences applied`);
    } else {
      log('framework', `No Differences found`);
    }
  }

  log('framework', `Starting Application with Profile ${getEnvironment() ?? 'None'} ...`);

  const app = express();

  const portsFromConfig = getConfig<number | number[] | undefined>('webserver.port');
  const webserverPort = await getFreePortFromConfig(portsFromConfig);
  if (webserverPort === 0) {
    log('critical', `Port(s) (${portsFromConfig}) already in use`);
  }
  const webserverHost = getConfig<string>('webserver.host');

  if (metaData.connectToServiceRegistry) {
    await connectToServiceRegistry({
      applicationName: metaData.serviceName,
      port: webserverPort,
    });
  }

  if (orm) {
    app.use((req, res, next) => {
      RequestContext.create(orm.em, next);
    });
  }

  const secretKey = getConfig('security.secretKey');

  if (
    getEnvironment() === 'production' &&
    !getConfig('security.noSecretKey') &&
    (secretKey === 'notverysecret' || secretKey === '$SECRET_KEY')
  ) {
    log(
      'critical',
      'No SECRET_KEY specified! Most services need one (for authentication against user-service). When your service dont need one you can suppress this message by add following configuration: "security.noSecretKey": true'
    );
  }

  app.use(bodyParser.json());
  app.use(express.json());

  if (metaData.hasHealthEndpoint === true || typeof metaData?.hasHealthEndpoint === 'undefined') {
    app.get('/health', (req, res) => res.status(200).send(metaData.serviceName));
  }

  // TODO add catch
  metaData?.beforeStartMethod(app).then(() => {
    app.use(ErrorHandler);
    app.listen(webserverPort, webserverHost, () => {
      log('info', `Webserver started on ${webserverHost}:${webserverPort}`);
    });
  });
}
