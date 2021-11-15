import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mergeOptions from 'merge-options';
import _get from 'lodash.get';
import { DotNestedKeys } from '../utils/types';
import { getEnvironment } from '../utils/getEnvironment';

const defaultConfig = {
  webserver: {
    port: 8080,
    host: 'localhost',
  },
  serviceRegistryPassphrase: '$SERVICE_REGISTRY_PASSPHRASE',
  logging: {
    transports: [
      {
        type: 'console',
        level: 'framework',
      },
    ],
  },
  security: {
    secretKey: 'notverysecret',
  },
};

dotenv.config();

const fileExtension = '.json';
const defaultConfigFileName = 'default';
const nodeEnv = getEnvironment();
// all possible config directories, ordered by relevance
const configDirectories: string[] = [
  path.resolve(process.cwd(), './src/config'),
  path.resolve(process.cwd(), './.config'),
  path.resolve(process.cwd(), './config'),
];

// take the first possible config directory which exists
const configDirectory: string | undefined = configDirectories.find((dir) => fs.existsSync(dir));

if (!configDirectory) {
  const errorMessagePrefix =
    'Could not find any config directory. Project configurations must be placed in one of the following directories:';
  // eslint-disable-next-line no-console
  console.error(`${errorMessagePrefix} ${configDirectories.join(', ')}`);
  process.exit(1);
}

const readAndParseFile = (filePath: string, ignoreParsingErrors = false): Record<string, unknown> | undefined => {
  try {
    // replace file variables with variables specified in .env
    let fileContent = fs.readFileSync(filePath, 'utf8');
    const regexForVariableReplacement = /\$([\w._-]+)/g;
    const variables = fileContent.match(new RegExp(regexForVariableReplacement)) ?? [];

    variables.forEach((variableWithDollarSign: string) => {
      const variableNameWithoutDollarSign = variableWithDollarSign.replaceAll('$', '');
      const newValue = process.env?.[variableNameWithoutDollarSign] ?? variableWithDollarSign;

      fileContent = fileContent.replaceAll(variableWithDollarSign, newValue);
    });

    return JSON.parse(fileContent);
  } catch {
    if (ignoreParsingErrors) {
      return {};
    }
    // eslint-disable-next-line no-console
    console.error('[Critical]', `Failed to parse config file: ${filePath}`);
    process.exit(1);
  }
};

const defaultConfigFile: Record<string, unknown> | undefined = readAndParseFile(
  path.resolve(configDirectory, defaultConfigFileName + fileExtension)
);

const loadedConfigFile: Record<string, unknown> | undefined = nodeEnv
  ? readAndParseFile(path.resolve(configDirectory, nodeEnv + fileExtension), true)
  : undefined;

let config: Record<string, unknown> | null = null;

const customMergeOptions = (...params: unknown[]) => mergeOptions.call({ ignoreUndefined: true }, ...params);

config = customMergeOptions(customMergeOptions(defaultConfig ?? {}, defaultConfigFile ?? {}), loadedConfigFile ?? {});

// with this beautiful method overload, we make ts safe that we always have a value and not undefined,
// if we access a config key which is present in the defaultConfig

function getConfig<T>(propertyName: DotNestedKeys<typeof defaultConfig>): T;
function getConfig<T>(propertyName: string): T;
function getConfig<T>(propertyName: string): T | undefined {
  return (_get(config, propertyName) as T) ?? undefined;
}

export { getConfig };
