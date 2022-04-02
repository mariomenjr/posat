import dotenv from "dotenv";
dotenv.config();

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { executeCsv, executeExchange } from "./src/controllers/cli.controller";

import { ExchangesSupported } from './src/configs/exchange.config';
import { safeGuard } from "./src/utils/system.utils";

yargs(hideBin(process.argv))
  .command(
    `csv [file]`,
    `Process csv-ed fills`,
    (yargs) =>
      yargs.positional(`path`, {
        describe: `Path for CSV file`,
        default: `./fills`,
      }),
    (argv) => safeGuard(() => executeCsv(argv.path))
  )
  .command(
    `exchange [exchange]`,
    `Process fills from Exchange APIs`,
    (yargs) =>
      yargs.positional(`exchange`, {
        describe: `Supported exchange flag`,
        default: ExchangesSupported.Coinbase,
      }),
    (argv) => safeGuard(() => executeExchange(argv.exchange))
  )
  .parse();
