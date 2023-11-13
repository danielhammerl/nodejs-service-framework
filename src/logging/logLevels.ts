// TODO logger api verbessern, log(("xyz" ist nicht typisiert

export type logLevels = 'critical' | 'error' | 'warning' | 'info' | 'framework' | 'debug' | 'silly';

export const winstonLogLevel: Record<logLevels, number> = {
  critical: 0,
  error: 100,
  warning: 200,
  info: 300,
  framework: 400,
  debug: 500,
  silly: 600,
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
