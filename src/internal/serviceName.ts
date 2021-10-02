let _serviceName: string;

export const setServiceName = (serviceName: string): void => {
  _serviceName = serviceName;
};

export const getServiceName = (): string => {
  return _serviceName;
};
