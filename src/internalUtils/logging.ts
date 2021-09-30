//TODO define logging levels
//TODO implement winston

/**
 * This method will show a console.debug output to the framework consumer
 * It will only be shown if in framework debug mode
 * @param params
 */
export const debug = (...params: unknown[]): void => {
    console.debug('[DEBUG] @danielhammerl/nodejs-service-framework:', ...params);
};

/**
 * This method will show a console.log output to the framework consumer
 * @param params
 */
export const info = (...params: unknown[]): void => {
  console.log('[INFO] @danielhammerl/nodejs-service-framework:', ...params);
};

/**
 * This method will show a console.warn output to the framework consumer
 * @param params
 */
export const warn = (...params: unknown[]): void => {
  console.warn('[WARN] @danielhammerl/nodejs-service-framework:', ...params);
};

/**
 * This method will show a console.error output to the framework consumer
 * @param params
 */
export const error = (...params: unknown[]): void => {
  console.error('[ERROR] @danielhammerl/nodejs-service-framework:', ...params);
};

/**
 * This method will show a console.error output to the framework consumer
 * Only call it on breaking errors!
 * @param params
 */
export const critical = (...params: unknown[]): void => {
  console.error('[CRITICAL] @danielhammerl/nodejs-service-framework:', ...params);
};
