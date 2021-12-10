export function roundByDecimals(value: number, decimalsCount: number): number {
  const factor: number = parseInt(`1${``.padEnd(decimalsCount, `0`)}`);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}