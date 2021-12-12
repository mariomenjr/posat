import CsvUtils from "../utils/csv.utils";

import { getAccountHistory } from "../services/exchange.service";
import {
  buildPositions,
  printBreakEven,
  printPositions,
} from "./analysis.controller";

export async function executeCsv(csvPath: string): Promise<void> {
  const fills = await CsvUtils.readFills(csvPath);

  const positions = buildPositions(fills);

  // const accountHistory = await getAccountHistory();
  // accountHistory.data.forEach((item) => {
  //   console.debug({ item });
  // });

  printPositions(positions);
  printBreakEven(positions);
}