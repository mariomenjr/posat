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
      `Portfolio %`,
      `Average Cost`,
      `Invested Amount`,
    ],
    colAligns: [`left`, `right`, `left`, `right`, `right`],
  });

  const breakEven = positions.breakEven;

  const reportPositions = positions
    .filter((x) => x.size > 0)
    .map((x) => {
      const investedAmount = roundByDecimals(x.size * x.breakEven, 2);
      const portfolioShare = roundByDecimals(
        (investedAmount / breakEven) * 100,
        2
      )
        .toFixed(2)
        .padStart(5, `0`);
      return {
        sizeUnit: x.sizeUnit,
        size: x.size,
        portfolioShare,
        breakEven: x.breakEven,
        investedAmount,
      };
    });


  reportPositions.sort((x, y) => {
    if (x.portfolioShare < y.portfolioShare) return +1;
    if (x.portfolioShare > y.portfolioShare) return -1;
    
    return 0;
  });

  const getDecimals = (x: Number) => `${x}`.split(`.`)[1]?.length ?? 0;
  const countDecimals = reportPositions.reduce((a, c) => {
    const s = getDecimals(c.size);
    const be = getDecimals(c.breakEven);

    return s > be ? s : be;
  }, 0);

  reportPositions.forEach((x) =>
    t.push([
      x.sizeUnit,
      x.size.toFixed(countDecimals),
      `${x.portfolioShare} %`,
      x.breakEven.toFixed(countDecimals),
      `${x.investedAmount} $`,
    ])
  );

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
