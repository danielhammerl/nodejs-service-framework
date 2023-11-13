export const getEnvironment = (): string => {
  return process?.env?.NODE_ENV?.toLowerCase() || '';
};
