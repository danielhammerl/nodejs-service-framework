import winston from 'winston';
import { logLevelColors, logLevels, winstonLogLevel } from './logLevels';
import { TransformableInfo } from 'logform';
import { findLongestStringInArray, nonNullable } from '../utils/array';
import { getConfig } from '../config';
import { InvalidConfigurationException } from '../exceptions/InvalidConfigurationException';
import { LoggingServiceTransport } from './LoggingServiceTransport';

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
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'TEST_FRAMEWORK'
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
    const lengthDiffBetweenLogLevelAndLongestLogLevel = longestLogLevelName.length - level.length;

    return `[${level.toUpperCase()}]${new Array(lengthDiffBetweenLogLevelAndLongestLogLevel + 2).join(' ')}`;
  };

  const templateFunction = (info: TransformableInfo): string => {
    return `${info.timestamp} ${formatLogLevel(info.level)} ${info.message}`;
  };

  logger = winston.createLogger({
    levels: winstonLogLevel,
    format: winston.format.combine(
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
