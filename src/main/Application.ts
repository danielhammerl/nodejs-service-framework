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
  initLogging(metaData.serviceName);

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
    log('critical', 'Uncaught exception! This may be a bug in nodejs-service-framework');
    log('critical', `Uncaught exception: ${err.stack}`);
    exitHandler(1);
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
  log('framework', `Starting Application with Profile ${getEnvironment() ?? 'None'} ...`);

  const app = express();

  const portsFromConfig = getConfig<number | number[]>('webserver.port');
  const webserverPort = await getFreePortFromConfig(portsFromConfig);
  if (webserverPort === 0) {
    log('critical', `Port(s) (${portsFromConfig}) already in use`);
    process.exit(1);
  }
  const webserverHost = getConfig<string>('webserver.host');

  if (metaData.connectToServiceRegistry) {
    try {
      const serviceRegistryResult = await connectToServiceRegistry({
        applicationName: metaData.serviceName,
        port: webserverPort,
      });

      if (serviceRegistryResult?.status === 200) {
        try {
          const body = await serviceRegistryResult.json();
          if (body.connected === true) {
            log('info', 'Connected to service registry');
          } else {
            log('error', 'Unexpected response from service registry');
          }
        } catch {
          log('error', 'Unexpected response from service registry');
        }
      } else if (serviceRegistryResult) {
        log('error', 'Could not connect to service registry', {
          metadata: {
            serverResponse: {
              status: serviceRegistryResult.status,
              body: await serviceRegistryResult.json(),
            },
          },
        });
      }
    } catch (e: unknown) {
      log('error', 'Could not connect to service registry', e as Error);
    }
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
    process.exit(1);
  }

  app.use(bodyParser.json());
  app.use(express.json());

  app.get('/health', (req, res) => res.status(200).send(metaData.serviceName));

  // TODO add catch
  metaData?.beforeStartMethod(app).then(() => {
    app.use(ErrorHandler);
    app.listen(webserverPort, webserverHost, () => {
      log('info', `Webserver started on ${webserverHost}:${webserverPort}`);
    });
  });
}
