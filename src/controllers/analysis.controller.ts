import Table from "cli-table3";
import undici from "undici";

import { PositionArray, PositionBuilder } from "./../models/Position.models";
import { FillArray } from "../models/Fill.models";
import { roundByDecimals } from "../utils/math.utils";
import { Price } from "../models/Price.model";
import { getPriceBySymbol } from "../services/price.service";

const getHumanGainRate = (gainRate: number) =>
  gainRate >= 100 ? gainRate - 100 : -1 * (100 - gainRate);

export function buildPositions(fills: FillArray): PositionArray {
  return PositionBuilder.buildPositions(fills);
}

export function printPositions(
  positions: PositionArray,
  prices: Map<string, Price>
): void {
  const t = new Table({
    head: [
      `Symbol`,
      `Portfolio %`,
      `Symbol Size`,
      `Market Price $`,
      `Average Cost $`,
      `Invested Amount $`,
      `Position Amount $`,
      `Gain/Loss %`,
    ],
    colAligns: [
      `left`,
      `right`,
      `right`,
      `right`,
      `right`,
      `right`,
      `right`,
      `right`,
    ],
  });

  const reportPositions = positions
    .filter((x) => x.size > 0)
    .map((x) => {
      const investedAmount = roundByDecimals(x.size * x.breakEven, 2);
      const portfolioShare = roundByDecimals(
        (investedAmount / positions.breakEven) * 100,
        2
      )
        .toFixed(2)
        .padStart(5, `0`);

      const marketPrice = prices.get(x.sizeUnit)?.priceUsd;

      const holdingAmount = roundByDecimals((marketPrice ?? 0) * x.size, 2);
      const gainRate = roundByDecimals(
        (holdingAmount / investedAmount) * 100,
        2
      );

      return {
        sizeUnit: x.sizeUnit,
        portfolioShare,
        size: x.size,
        marketPrice,
        breakEven: x.breakEven,
        investedAmount,
        holdingAmount,
        gainRate: getHumanGainRate(gainRate),
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
      `${x.portfolioShare} %`,
      x.size.toFixed(countDecimals),
      `${x.marketPrice?.toFixed(2)} $`,
      `${x.breakEven.toFixed(countDecimals)} $`,
      `${x.investedAmount} $`,
      `${x.holdingAmount.toFixed(2)} $`,
      `${x.gainRate.toFixed(2)} %`,
    ])
  );

  console.log(t.toString());
}

export function printBreakEven(
  positions: PositionArray,
  prices: Map<string, Price>
): void {
  const t = new Table({
    head: [`Invested Amount $`, `Position Amount $`, `Gain/Loss %`],
    colAligns: [`right`, `right`, `right`],
  });

  const holdingAmount = roundByDecimals(
    positions
      .filter((x) => x.size > 0)
      .reduce((a, x) => {
        const marketPrice = prices.get(x.sizeUnit)?.priceUsd;
        return a + roundByDecimals((marketPrice ?? 0) * x.size, 2);
      }, 0),
    2
  );

  const gainRate = roundByDecimals(
    (holdingAmount / positions.breakEven) * 100,
    2
  );

  t.push([
    `${positions.breakEven} $`,
    `${holdingAmount} $`,
    `${getHumanGainRate(gainRate)} %`,
  ]);

  console.log(t.toString());
}

export async function reportPositions(fills: FillArray) {
  const positions = buildPositions(fills);

  const prices = (
    await Promise.all(
      positions.map(async (x): Promise<Price> => {
        const f = await getPriceBySymbol(x.sizeUnit);

        return {
          ...f,

          changePercent24Hr: Number(f.changePercent24Hr),
          marketCapUsd: Number(f.marketCapUsd),
          maxSupply: Number(f.maxSupply),
          priceUsd: Number(f.priceUsd),
          rank: Number(f.rank),
          supply: Number(f.supply),
          volumeUsd24Hr: Number(f.volumeUsd24Hr),
          vwap24Hr: Number(f.vwap24Hr),
        };
      })
    )
  ).reduce(
    (a: Map<string, Price>, x) => a.set(x.symbol, x),
    new Map<string, Price>()
  );

  printPositions(positions, prices);
  printBreakEven(positions, prices);
}
