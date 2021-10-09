import tcpPortUsed from 'tcp-port-used';

/**
 * receives one or multiple ports and return the ( first ) port which is free and not already in use,
 * if there isnt any free port, returns 0;
 * @param config
 */
export const getFreePortFromConfig = async (config: number | number[]): Promise<number> => {
  if (Array.isArray(config)) {
    for (let index = 0; index < config.length; index++) {
      if (await tcpPortUsed.check(config[index])) {
        return config[index];
      }
    }

    return 0;
  } else {
    if (await tcpPortUsed.check(config)) {
      return config;
    }

    return 0;
  }
};
