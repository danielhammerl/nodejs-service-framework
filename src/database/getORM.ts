import { MikroORM } from '@mikro-orm/core';
import { MikroORMOptions } from '@mikro-orm/core/utils/Configuration';
import { getConfig } from '../config';
import { log } from '../logging';

let orm: MikroORM | null = null;

export const _initOrm = async (
  entities: MikroORMOptions['entities'],
  mikroOrmMigrationSettings: MikroORMOptions['migrations']
): Promise<MikroORM> => {
  const databaseConfig = getConfig<{ type: 'mysql'; url: string }>('database');
  if (!databaseConfig) {
    log('critical', 'database is not configured correctly');
    process.exit(1);
  }

  // TODO what if we pass the wrong db type as config?
  try {
    orm = await MikroORM.init({
      type: databaseConfig.type,
      clientUrl: databaseConfig.url,
      entities,
      migrations: mikroOrmMigrationSettings,
    });
    return orm;
  } catch (e) {
    log('critical', 'Failed initializing database connection', e as Error);
    process.exit(1);
  }
};

export const getOrm = (): MikroORM => {
  if (orm) {
    return orm;
  }

  log('error', 'Failed accessing database! Not initialized yet');
  throw new Error('Failed accessing database! Not initialized yet');
};
