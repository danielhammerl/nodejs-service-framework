import { ApplicationConfig } from '../interfaces';

const defaultApplicationConfig: ApplicationConfig = {
  frameworkDebugMode: false,
};

//TODO move to normal config??

let applicationConfig: ApplicationConfig | null = null;

export const getApplicationConfig = (): ApplicationConfig => {
  return applicationConfig || defaultApplicationConfig;
};

export const setApplicationConfig = (config: ApplicationConfig): void => {
  applicationConfig = config;
};
