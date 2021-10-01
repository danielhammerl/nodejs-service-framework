import winston from 'winston';
import { logLevelColors, logLevels, winstonLogLevel } from './logLevels';
import { TransformableInfo } from 'logform';
import { findLongestStringInArray } from '../utils/array';
import { getConfig } from '../config';
import { InvalidConfigurationException } from '../exceptions/InvalidConfigurationException';

// TODO farben funktionieren noch nicht
winston.addColors(logLevelColors);

const getLoggingTransports = (): winston.transport[] => {
  const loggingConfiguration = getConfig<{ type: 'console'; level: logLevels }[]>('logging.transports') ?? [];

  return [
    ...loggingConfiguration.map(({ type, level }, index) => {
      if (type === 'console') {
        return new winston.transports.Console({ level });
      }
      throw new InvalidConfigurationException(`logging.transports[${index}].type`);
    }),
  ];
};

// This methods formats the loglevel output
// Besides that it adds brackets around the level and print it as uppercase, it also pads the string
// with whitespaces so that all log levels are equal long and the message always starts in the same column
// [INFO]       x
// [FRAMEWORK]  x
const formatLogLevel = (level: string): string => {
  const longestLogLevelName = findLongestStringInArray(Object.keys(winstonLogLevel));
  const lengthDiffBetweenLogLevelAndLongestLogLevel = longestLogLevelName.length - level.length;

  return '[' + level.toUpperCase() + ']' + new Array(lengthDiffBetweenLogLevelAndLongestLogLevel + 2).join(' ');
};

const templateFunction = (info: TransformableInfo): string => {
  return `${info.timestamp} ${formatLogLevel(info.level)} ${info.message}`;
};

// TODO remove silly default log level
export const logger = winston.createLogger({
  levels: winstonLogLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    winston.format.printf(templateFunction),
    winston.format.colorize()
  ),
  transports: getLoggingTransports(),
});
