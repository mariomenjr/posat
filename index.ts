import Table from "cli-table3";

import CsvUtils from "./src/utils/csv.utils";

import { FillArray } from "./src/models/Exchange.models";
import { Position, PositionBuilder } from "./src/models/Position.models";

CsvUtils.readFills()
  .then((fills: FillArray) => {
    const table = new Table({
      head: [`Unit`, `Size`, `Break Even`],
      colWidths: [15, 30, 30],
    });

    PositionBuilder.buildPositions(fills).forEach((x) => {
      const isError = x.constructor.name.toLowerCase().endsWith(`error`);

      if (isError)
        table.push([
          {
            colSpan: table.options.colWidths.length,
            content: (x as Error).message,
          },
        ]);
      else
        table.push([
          (x as Position).sizeUnit,
          (x as Position).size,
          (x as Position).breakEven,
        ]);
    });

    console.debug(table.toString());
  })
  .catch((e: Error) => {
    console.error(e.message);
    process.exit();
  });
