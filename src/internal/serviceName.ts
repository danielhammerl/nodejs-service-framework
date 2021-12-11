import EventEmitter from 'events';
import { log } from '../logging';

let _serviceName: string | undefined;

export const setServiceName = (serviceName: string): void => {
  _serviceName = serviceName;
  const eventEmitter = new EventEmitter();
  eventEmitter.emit('serviceNameSet');
};

/**
 * returns service name. Throws an error when service name is not defined
 */
export const getServiceName = (): string => {
  if (!_serviceName) {
    log('error', 'Trying to access service name, but no name is set');
    throw new Error('Trying to access service name, but no name is set');
  }

  return _serviceName;
};

/**
 * returns service name: If service name is not defined, return undefined
 */
export const getServiceNameUnsafe = () => {
  return _serviceName;
};
