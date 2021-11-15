import fetch, { Response } from 'node-fetch';
import { log } from '../logging';
import { getConfig } from '../config';
import { getEnvironment } from '../utils/getEnvironment';

export interface ServiceRegistryData {
  applicationName: string;
  port: number;
}

export const connectToServiceRegistry = async (serviceData: ServiceRegistryData): Promise<Response | void> => {
  if (getEnvironment() !== 'production' && !getConfig('serviceRegistry.forceConnect')) {
    log('warning', 'Prevented connect to service registry, because environment dont equal production');
    return;
  }
  return await fetch('http://localhost:30000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...serviceData, password: getConfig('serviceRegistryPassphrase') }),
  });
};
