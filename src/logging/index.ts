import winston, { format } from 'winston';
import { logLevelColors, logLevels, winstonLogLevel } from './logLevels';
import { TransformableInfo } from 'logform';
import { findLongestStringInArray, nonNullable } from '../utils/array';
import { getConfig } from '../config';
import { InvalidConfigurationException } from '../exceptions';
import { LoggingServiceTransport } from './LoggingServiceTransport';
import { getEnvironment } from '../utils/getEnvironment';

let logger: winston.Logger | null = null;

export const initLogging = (serviceName: string): void => {
  const getLoggingTransports = (): winston.transport[] => {
    const loggingConfiguration = getConfig<{ type: 'console'; level: logLevels }[]>('logging.transports') ?? [];
    return [
      ...loggingConfiguration.map(({ type, level }, index) => {
        if (type === 'console') {
          return new winston.transports.Console({ level });
        }
        throw new InvalidConfigurationException(`logging.transports[${index}].type`);
      }),
      // error and critical will be logged to logging-service on production environments
      getEnvironment() === 'production' || getEnvironment() === 'test_framework'
        ? new LoggingServiceTransport(serviceName, { level: 'error' })
        : null,
    ].filter(nonNullable);
  };

  // This methods formats the loglevel output
  // Besides that it adds brackets around the level and print it as uppercase, it also pads the string
  // with whitespaces so that all log levels are equal long and the message always starts in the same column
  // [INFO]       x
  // [FRAMEWORK]  x
  const formatLogLevel = (level: string): string => {
    const longestLogLevelName = findLongestStringInArray(Object.keys(winstonLogLevel));
    // +10 because of the additional signs for colorizing
    const lengthDiffBetweenLogLevelAndLongestLogLevel = longestLogLevelName.length + 10 - level.length;
    const whiteSpaces = new Array(lengthDiffBetweenLogLevelAndLongestLogLevel + 2).join(' ');
    return `[${level}]${whiteSpaces}`;
  };

  const templateFunction = (info: TransformableInfo): string => {
    let message = `${info.timestamp} ${formatLogLevel(info.level)} ${info.message}`;
    if (getConfig('debugMode') && info?.stack) {
      // eslint-disable-next-line prefer-template
      message += '\n' + info.stack;
    }
    return message;
  };

  logger = winston.createLogger({
    levels: winstonLogLevel,
    format: winston.format.combine(
      format((info) => {
        info.level = info.level.toUpperCase();
        return info;
      })(),
      winston.format.colorize({ colors: logLevelColors }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
      winston.format.printf(templateFunction)
    ),
    transports: getLoggingTransports(),
  });
};

interface additionalLogParams {
  stack?: unknown;
  metadata?: unknown;
}

export const log = (logLevel: logLevels, message: string, params?: additionalLogParams): void => {
  if (!logger) {
    // eslint-disable-next-line no-console
    console.error(
      `ERROR: Logger not defined. You can call this method only inside and Application Context. Tried to log following: [${logLevel}] ${message}`
    );
    return;
  }
  logger.log(logLevel, message, params);
};
