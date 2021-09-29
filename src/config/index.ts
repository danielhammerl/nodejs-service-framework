import production from './production';
import { ServiceConfig } from './ServiceConfig';
import localConfig from './local';
import accTest from './accTest';

const getConfig = (): ServiceConfig => {
  switch (process.env.NODE_CONFIG_ENV) {
    case 'local':
      return localConfig;
    case 'acc-test':
      return accTest;
    default:
      return production;
  }
};

export default getConfig();
