export function isIntegerArray(x: number[]): boolean {
  return Array.isArray(x) && x.every((i) => Number.isInteger(i));
}

export function hasFillProps(x: object[]): boolean {
  return (
    Array.isArray(x) &&
    [
      `portfolio`,
      `tradeId`,
      `product`,
      `side`,
      `createdAt`,
      `fiatUnit`,
      `size`,
      `sizeUnit`,
      `price`,
      `fee`,
      `total`,
    ].reduce((y: boolean, i: string): boolean => {
      return y && x.every((f) => {
        return f.hasOwnProperty(i);
      });
    }, true)
  );
}
