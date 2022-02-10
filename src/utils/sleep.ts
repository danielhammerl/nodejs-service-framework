export const MS_PER_SECOND = 1000;

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
