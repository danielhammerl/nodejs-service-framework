import { MikroORM } from '@mikro-orm/core';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { getConfig } from '../config';
import { log } from '../logging';

let orm: MikroORM | null = null;

export const _initOrm = async (entities: MikroORMOptions['entities']): Promise<MikroORM> => {
  const databaseConfig = getConfig<{ type: 'mysql'; url: string }>('database');
  if (!databaseConfig) {
    // TODO error handling
    throw new Error('database is not configured correctly');
  }

  // TODO what if we pass the wrong db type as config?
  try {
    orm = await MikroORM.init({
      type: databaseConfig.type,
      clientUrl: databaseConfig.url,
      entities,
    });
    return orm;
  } catch (e) {
    log('error', 'Failed initializing database connection');
    throw e;
  }
};

export const getOrm = async (): Promise<MikroORM> => {
  if (orm) {
    return orm;
  }

  log('error', 'Failed accessing database! Not initialized yet');
  throw new Error('Failed accessing database! Not initialized yet');
};
