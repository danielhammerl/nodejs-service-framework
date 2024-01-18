import { MikroORM, MikroORMOptions } from '@mikro-orm/core';
import { getConfig } from '../config';
import { log } from '../logging';
import { DriverException } from '@mikro-orm/core/exceptions';

let orm: MikroORM | null = null;

export const _initOrm = async (entities: MikroORMOptions['entities']): Promise<MikroORM> => {
  const databaseConfig = getConfig<{ type: 'mysql'; url: string; verboseLogging?: boolean }>('database');
  if (!databaseConfig) {
    return log('critical', 'database is not configured correctly');
  }

  // TODO what if we pass the wrong db type as config?
  try {
    orm = await MikroORM.init({
      type: databaseConfig.type,
      clientUrl: databaseConfig.url,
      entities,
      verbose: databaseConfig.verboseLogging,
      debug: databaseConfig.verboseLogging,
    });
    return orm;
  } catch (e) {
    if ((e as DriverException).code === 'ERR_INVALID_URL') {
      return log('critical', `Failed initializing database connection: ${databaseConfig.url} is not a valid url`);
    }
    return log('critical', 'Failed initializing database connection', e as Error);
  }
};

export const getOrm = (): MikroORM => {
  if (orm) {
    return orm;
  }

  log('error', 'Failed accessing database! Not initialized yet');
  throw new Error('Failed accessing database! Not initialized yet');
};
