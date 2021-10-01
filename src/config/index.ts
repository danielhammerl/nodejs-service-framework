import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mergeOptions from 'merge-options';
import _get from 'lodash.get';
import { DotNestedKeys } from '../utils/types';

const defaultConfig = {
  webserver: {
    port: 8080,
    host: 'localhost',
  },
  logging: {
    transports: [
      {
        type: 'console',
        level: 'framework',
      },
    ],
  },
};

dotenv.config();

// TODO add overwrite by env variable

const fileExtension = '.json';
const defaultConfigFileName = 'default';
const nodeEnv = process.env.NODE_ENV;

const readAndParseFile = (filePath: string): Record<string, unknown> | undefined => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
};

const defaultConfigFile: Record<string, unknown> | undefined = readAndParseFile(
  path.resolve(process.cwd(), './config', defaultConfigFileName + fileExtension)
);

const loadedConfigFile: Record<string, unknown> | undefined = nodeEnv
  ? readAndParseFile(path.resolve(process.cwd(), './config', nodeEnv + fileExtension))
  : undefined;

let config: Record<string, unknown> | null = null;

const customMergeOptions = (...params: unknown[]) => mergeOptions.call({ ignoreUndefined: true }, ...params);

config = customMergeOptions(customMergeOptions(defaultConfig ?? {}, defaultConfigFile ?? {}), loadedConfigFile ?? {});

// with this beautiful method overload, we make ts safe that we always have a value and not undefined,
// if we access a config key which is present in the defaultConfig

function getConfig<T extends unknown>(propertyName: DotNestedKeys<typeof defaultConfig>): T;
function getConfig<T extends unknown>(propertyName: string): T;
function getConfig<T extends unknown>(propertyName: string): T | undefined {
  return (_get(config, propertyName) as T) ?? undefined;
}

export { getConfig };
