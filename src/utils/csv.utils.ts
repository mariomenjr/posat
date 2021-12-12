import fs from "fs";
import csv from "csv-parser";

import { FillArray, Fill } from "../models/Fill.models";

export default class CsvUtils {
  static readFills(fileOrFolderPath: string): Promise<FillArray> {
    return new Promise<FillArray>((resolve, reject) => {
      const fills: FillArray = new FillArray();

      // TODO: We may want to read all fills files available.
      fs.createReadStream(fileOrFolderPath) //`./fills/fills.20211205.1247.csv`)
        .pipe(
          csv({
            skipLines: 1,
            strict: true,
            headers: [
              `portfolio`,
              `tradeId`,
              `product`,
              `side`,
              `createdAt`,
              `size`,
              `sizeUnit`,
              `price`,
              `fee`,
              `total`,
              `fiatUnit`,
            ],
          })
        )
        .on(`data`, (r: Fill) =>
          // the r: Fill only serves for intellisense purposes
          fills.push({
            ...r,

            tradeId: Number(r.tradeId),
            size: Number(r.size),
            price: Number(r.price),
            fee: Number(r.fee),
            total: Number(r.total),

            createdAt: new Date(r.createdAt),
          })
        )
        .on(`end`, () => {
          try {
            resolve(fills);
          } catch (error) {
            reject(error);
          }
        })
        .on(`error`, (error) => reject(error));
    });
  }
}
