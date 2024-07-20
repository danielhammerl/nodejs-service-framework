export const getEnvironment = (): string => {
  return process?.env?.NODE_ENV?.toLowerCase() || '';
};

export const isProductionEnvironment = (): boolean => {
  return getEnvironment() === 'production';
};

export const isLocalEnvironment = (): boolean => {
  return getEnvironment() === 'local';
};
