import fetch, { Response } from 'node-fetch';
import { log } from '../logging';

export interface ServiceRegistryData {
  applicationName: string;
  port: number;
}

export const connectToServiceRegistry = async (serviceData: ServiceRegistryData): Promise<Response | void> => {
  if (process.env.NODE_ENV !== 'production') {
    log('warning', 'Prevented connect to service registry, because environment dont equal production');
    return;
  }
  return await fetch('http://localhost:30000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serviceData),
  });
};
