import Table from "cli-table3";

import { PositionArray, PositionBuilder } from "./../models/Position.models";
import { FillArray } from "../models/Fill.models";
import { roundByDecimals } from "../utils/math.utils";

export function buildPositions(fills: FillArray): PositionArray {
  return PositionBuilder.buildPositions(fills);
}

export function printPositions(positions: PositionArray): void {
  const t = new Table({
    head: [
      `Unit`,
      `Portfolio %`,
      `Size`,
      `Break Even Entry`,
      `Position in USD`,
    ],
    colWidths: [15, 15, 15, 20, 20],
    colAligns: [`left`, `left`, `right`, `right`, `right`],
  });

  const breakEven = positions.breakEven;

  positions.sort((x, y) => {
    if (x.sizeUnit < y.sizeUnit) return -1;
    if (x.sizeUnit > y.sizeUnit) return +1;
    
    return 0;
  });

  positions
    .filter((x) => x.size > 0)
    .forEach((x) => {
      const _breakEven = roundByDecimals(x.size * x.breakEven, 2);
      t.push([
        x.sizeUnit,
        `${roundByDecimals((_breakEven / breakEven) * 100, 2)
          .toFixed(2)
          .padStart(5, `0`)} %`,
        x.size.toFixed(4),
        x.breakEven.toFixed(4),
        `${_breakEven.toFixed(2)} $`,
      ]);
    });

  console.log(t.toString());
}

export function printBreakEven(positions: PositionArray): void {
  const t = new Table({
    head: [`Break Even`],
    colWidths: [20],
  });

  t.push([`$ ${positions.breakEven}`]);

  console.log(t.toString());
}

export function reportPositions(fills: FillArray) {
  const positions = buildPositions(fills);

  printPositions(positions);
  printBreakEven(positions);
}
