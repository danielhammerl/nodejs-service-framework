export const findLongestStringInArray = (arr: string[]): string =>
  arr.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  });
