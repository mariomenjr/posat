import CsvUtils from "./src/utils/csv.utils";

import { FillArray } from "./src/models/Exchange.models";

import {
  buildPositions,
  printBreakEven,
  printPositions,
} from "./src/controllers/analysis.controller";

CsvUtils.readFills()
  .then((fills: FillArray) => {
    const positions = buildPositions(fills);

    printPositions(positions);
    printBreakEven(positions);
  })
  .catch((e: Error) => {
    console.error(e.message);
    process.exit();
  });
