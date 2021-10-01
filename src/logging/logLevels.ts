export type logLevels = 'critical' | 'error' | 'warning' | 'info' | 'framework' | 'debug' | 'silly';

export const winstonLogLevel: Record<logLevels, number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
  framework: 4,
  debug: 5,
  silly: 6,
};

export const logLevelColors = {
  critical: 'magenta',
  error: 'red',
  warning: 'yellow',
  info: 'white',
  framework: 'cyan',
  debug: 'cyan',
  silly: 'cyan',
};
