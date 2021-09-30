import config from 'config';

const defaultConfig = {
  port: 8080,
  host: 'localhost',
};

export const setConfigDefaults = (): void => {
  config.util.setModuleDefaults('webserver', defaultConfig);
};
