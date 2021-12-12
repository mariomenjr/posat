import dotenv from "dotenv";

dotenv.config();

import { executeCsv } from "./src/controllers/cli.controller";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(
    `csv [file]`,
    `Process csv-ed fills`,
    (yargs) =>
      yargs.positional(`path`, {
        describe: `Path for CSV file`,
        default: `./fills/fills.20211205.1247.csv`,
      }),
    (argv) => executeCsv(argv.path)
  )
  .command(
    `exchange [exchange]`,
    `Process fills from Exchange APIs`,
    (yargs) =>
      yargs.positional(`exchange`, {
        describe: `Supported exchange flag`,
        default: `coinbase`,
      }),
    (argv) => {
      switch (argv.exchange) {
        case `coinbase`:
          console.debug({ process });
          break;

        default:
          throw new Error(`Not supported Exchange`); // TODO: Set in model
      }
    }
  )
  .parse();
