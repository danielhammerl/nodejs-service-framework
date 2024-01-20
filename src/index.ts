import { Express } from 'express';

export { InitApplication, ApplicationMetaData } from './main/Application';
export { getOrm } from './database/getORM';
export { getConfig } from './config';
export { winstonLogLevel } from './logging/logLevels';
export { log } from './logging';
export * from './types';
export * from './utils/request';
export * from './exceptions';
export { AuthenticationHandler } from './middleware/AuthenticationMiddleware';
export { ServiceRegistryData } from './apiClients/serviceRegistry';
export { getEnvironment } from './utils/getEnvironment';
export { FileDatabase } from './utils/fileDatabase';

export type App = Express;
