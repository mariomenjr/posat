import Table from "cli-table3";

import CsvUtils from "./src/utils/csv.utils";

import { FillArray } from "./src/models/Exchange.models";
import { Position, PositionBuilder } from "./src/models/Position.models";
import { roundByDecimals } from "./src/utils/math.utils";

CsvUtils.readFills()
  .then((fills: FillArray) => {
    const positionsTable = new Table({
      head: [
        `Unit`,
        `Size`,
        `Break Even Entry`,
        `Break Even`,
        `Portfolio Share %`,
      ],
      colWidths: [15, 15, 20, 30],
    });

    const positions = PositionBuilder.buildPositions(fills)
      .filter((x) => {
        const isError = x.constructor.name.toLowerCase().endsWith(`error`);
        return !isError && (x as Position).size > 0;
      })
      .map((x) => x as Position);

    const breakEven = roundByDecimals(
      positions.reduce<number>(
        (t: number, x: Position) => x.breakEven * x.size + t,
        0
      ),
      2
    );

    positions.forEach((x) => {
      const _breakEven = roundByDecimals(x.size * x.breakEven, 2);
      positionsTable.push([
        x.sizeUnit,
        x.size,
        x.breakEven,
        `$ ${_breakEven}`,
        `${roundByDecimals((_breakEven/breakEven)*100, 2)} %`
      ])
    });

    const summaryTable = new Table({
      head: [`Break Even`],
    });

    summaryTable.push([`$ ${breakEven}`]);

    console.log(positionsTable.toString());
    console.log(summaryTable.toString());
  })
  .catch((e: Error) => {
    console.error(e.message);
    process.exit();
  });
