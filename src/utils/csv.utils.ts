import fs from "fs";
import path from "path";
import csv from "csv-parser";

import { FillArray, Fill } from "../models/Fill.models";

export default class CsvUtils {
  static async readFills(fileOrFolderPath: string): Promise<FillArray> {
    
    if (fs.lstatSync(fileOrFolderPath).isDirectory()) {
      const fillPromises = fs
        .readdirSync(fileOrFolderPath)
        .filter((x) => x.toLowerCase().endsWith(`.csv`))
        .map((filePath) => CsvUtils.readFill(path.join(fileOrFolderPath, filePath)));

      const fills = await Promise.all(fillPromises);

      return fills.reduce((fillArray, _fills) => {
        fillArray.push(..._fills);
        return fillArray;
      }, new FillArray());
    }

    return CsvUtils.readFill(fileOrFolderPath);
  }

  static readFill(filePath: string): Promise<FillArray> {
    return new Promise<FillArray>((resolve, reject) => {
      const fills: FillArray = new FillArray();

      fs.createReadStream(filePath)
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
