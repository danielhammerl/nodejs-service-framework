import tcpPortUsed from 'tcp-port-used';
import { getRandomNumber } from './randomNumber';

/**
 * receives one or multiple ports and return the ( first ) port which is free and not already in use,
 * if there isn't any free port, returns 0;
 * @param config
 */
export const getFreePortFromConfig = async (config: number | number[] | string | undefined): Promise<number> => {
  if (Array.isArray(config)) {
    for (let index = 0; index < config.length; index++) {
      if (!(await tcpPortUsed.check(config[index]))) {
        return config[index];
      }
    }

    return 0;
  } else if (typeof config === 'number' || typeof config === 'string') {
    const port = typeof config === 'number' ? config : Number.parseInt(config);
    if (await tcpPortUsed.check(port)) {
      return 0;
    }
    return port;
  } else {
    let number: number | undefined;
    do {
      number = getRandomNumber(30000, 40000);
    } while (await tcpPortUsed.check(number));
    return number;
  }
};
