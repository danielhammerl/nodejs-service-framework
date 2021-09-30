import express, { Express } from 'express';

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

import config from 'config';
import { critical, debug, error, info } from '../internalUtils/logging';
import { setConfigDefaults } from '../internal/setConfigDefaults';
import { _initOrm } from '../utils/getORM';
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
export class BaseApplication {
  dbEntities: MikroORMOptions['entities'] = [];

  constructor() {
    const useDatabase = config.has('database.type') && config.has('database.url');

    if (useDatabase) {
      debug('Connecting to database ...');
      if (this.dbEntities.length === 0) {
        // TODO should be suppressable
        console.warn('No mikro orm entities specified');
      }
      _initOrm(this.dbEntities ?? []).then((orm) => {
        this._appStartUp(orm);
      });
    } else {
      this._appStartUp();
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
  }

  // @ts-expect-error
  public main = (app: Express): Promise<void> => {
    //error("Error in Application decorator! Class must have a method 'main'");
    //process.exit(1);
  };

  protected beforeStart = () => {};

  private _appStartUp = (orm?: MikroORM) => {
    debug('Run before start handler ...');
    this.beforeStart();

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
    this.main(app).then(() => {
      app.listen(webserverPort, webserverHost, () => {
        info(`Webserver started on ${webserverHost}:${webserverPort}`);
      });
    });
  };
}
