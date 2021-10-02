export const findLongestStringInArray = (arr: string[]): string =>
  arr.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  });

export const nonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};
