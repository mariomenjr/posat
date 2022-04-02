import fs from "fs";
import path from "path";
import { exit } from "process";

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

export function exitIfNoDotenv(): void {
  if (!fs.existsSync(path.resolve(__dirname, `../../.env`))) {
    console.log(`[fatal] Not .env file found. Please create one with the following variables CB_API_KEY, CB_API_SECRET, CB_PASSPHRASE. Refer to the README.md file for more info.`);
    exit(1);
  }
}