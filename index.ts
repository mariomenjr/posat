import CsvUtils from "./src/utils/csv.utils";

import { FillArray } from "./src/models/Exchange.models";
import { PositionBuilder } from "./src/models/Position.models";

CsvUtils.readFills()
  .then((fills: FillArray) => PositionBuilder.buildPositions(fills))
  .catch((e: Error) => {
    console.error(e.message);
    process.exit();
  });
