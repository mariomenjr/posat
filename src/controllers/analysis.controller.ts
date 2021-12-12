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
      `Size`,
      `Break Even Entry`,
      `Break Even`,
      `Portfolio Share %`,
    ],
    colWidths: [15, 15, 20, 30],
  });

  const breakEven = positions.breakEven;

  positions.forEach((x) => {
    const _breakEven = roundByDecimals(x.size * x.breakEven, 2);
    t.push([
      x.sizeUnit,
      x.size,
      x.breakEven,
      `$ ${_breakEven}`,
      `${roundByDecimals((_breakEven / breakEven) * 100, 2)} %`,
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