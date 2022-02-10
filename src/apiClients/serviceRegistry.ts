import fetch, { Response } from 'node-fetch';
import { log } from '../logging';
import { getConfig } from '../config';
import { getEnvironment } from '../utils/getEnvironment';
import { MS_PER_SECOND, sleep } from '../utils/sleep';

export interface ServiceRegistryData {
  applicationName: string;
  port: number;
}

const connectToServiceRegistryApiCall = async (serviceData: ServiceRegistryData): Promise<Response | void> => {
  return await fetch('http://localhost:30000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...serviceData, password: getConfig('serviceRegistryPassphrase') }),
  });
};

export const connectToServiceRegistry = async (serviceData: ServiceRegistryData): Promise<void> => {
  if (getEnvironment() !== 'production' && !getConfig('serviceRegistry.forceConnect')) {
    log('warning', 'Prevented connect to service registry, because environment dont equal production');
    return;
  }

  let connected = false;
  let tryCount = 0;

  do {
    try {
      const response = await connectToServiceRegistryApiCall(serviceData);

      if (response?.status === 200) {
        try {
          const body = await response.json();
          if (body.connected === true) {
            log('info', 'Connected to service registry');
            connected = true;
          } else {
            if (tryCount < 5) {
              log('info', 'Unexpected response from service registry. Try again in 1 minute');
            } else {
              log('critical', 'Unexpected response from service registry');
            }
          }
        } catch {
          if (tryCount < 5) {
            log('info', 'Failed to parse response from service registry. Try again in 1 minute');
          } else {
            log('critical', 'Failed to parse response from service registry');
          }
        }
      } else if (response) {
        if (tryCount < 5) {
          log('info', 'Could not connect to service registry. Try again in 1 minute');
        } else {
          log('critical', 'Could not connect to service registry', {
            metadata: {
              serverResponse: {
                status: response.status,
                body: await response.json(),
              },
            },
          });
        }
      }
    } catch (e) {
      if (tryCount < 5) {
        log('info', 'Could not connect to service registry. Try again in 1 minute');
      } else {
        log('critical', 'Could not connect to service registry');
      }
    }

    if (!connected) {
      tryCount++;
      await sleep(MS_PER_SECOND * 60);
    }
  } while (!connected || tryCount < 5);
};
