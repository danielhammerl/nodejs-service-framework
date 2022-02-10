/**
 * not crypto-safe!
 * @param min
 * @param max
 */
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
