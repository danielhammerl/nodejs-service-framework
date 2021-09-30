import { MikroORM } from '@mikro-orm/core';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import config from 'config';

let orm: MikroORM | null = null;

export const _initOrm = async (entities: MikroORMOptions['entities']): Promise<MikroORM> => {
  if (!config.has('database.url') || !config.has('database.type')) {
    // TODO error handling
    throw new Error('database is not configured correctly');
  }

  orm = await MikroORM.init({
    type: config.get('database.type'),
    clientUrl: config.get('database.url'),
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
