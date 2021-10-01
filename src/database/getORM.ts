import { MikroORM } from '@mikro-orm/core';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { getConfig } from '../config';

let orm: MikroORM | null = null;

export const _initOrm = async (entities: MikroORMOptions['entities']): Promise<MikroORM> => {
  const databaseConfig = getConfig<{ type: 'mysql'; url: string }>('database');
  if (!databaseConfig) {
    // TODO error handling
    throw new Error('database is not configured correctly');
  }

  // TODO what if we pass the wrong db type as config?
  orm = await MikroORM.init({
    type: databaseConfig.type,
    clientUrl: databaseConfig.url,
    entities,
  });

  return orm;
};

export const getOrm = async (): Promise<MikroORM> => {
  if (orm) {
    return orm;
  }

  // TODO error handling
  throw Error('MikroORM is not initialized yet ...');
};
