import { log } from '../logging';

let _serviceName: string | undefined;

export const setServiceName = (serviceName: string): void => {
  _serviceName = serviceName;
};

export const getServiceName = (): string => {
  if (typeof _serviceName === 'undefined') {
    log('error', 'Trying to access service name, but no name is set');
    throw new Error('Trying to access service name, but no name is set');
  }

  return _serviceName;
};
