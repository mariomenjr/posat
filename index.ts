import { PositionBuilder } from './src/models/Position.models';
import CsvUtils from "./src/utils/csv.utils";

import { FillArray } from './src/models/Exchange.models';

CsvUtils.readFills()
  .then((fills: FillArray) => PositionBuilder.buildPositions(fills))
  .catch((e: Error) =>
    console.error(`Unable to load fills due to: ${e.message}`)
  );
