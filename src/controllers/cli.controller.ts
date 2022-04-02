import { ExchangesSupported } from "./../configs/exchange.config";

import { FillError } from "./../errors/fill.error";

import CsvUtils, { JsonUtils } from "../utils/csv.utils";
import { isIntegerArray, hasFillProps } from "../utils/validators";

import { FillService } from "./../services/exchange.service";

import { reportPositions } from "./analysis.controller";

import { FillSideEnum, Fill, FillArray } from "./../models/Fill.models";

export async function executeCsv(csvPath: string): Promise<void> {
  const fills = await CsvUtils.readFills(csvPath);

  reportPositions(fills);
}

export async function executeExchange(es: ExchangesSupported): Promise<void> {
  const fills: Fill[] = [];

  const fillsIgnoreJson:number[] = (await JsonUtils.readJson("../../custom/fills.ignore.json")) ?? [];
  if (!isIntegerArray(fillsIgnoreJson)) throw FillError.fillIgnoreJsonNotSupported();
  
  const fillsPushJson:Fill[] = (await JsonUtils.readJson("../../custom/fills.push.json")) ?? [];
  if (!hasFillProps(fillsPushJson)) throw FillError.fillPushJsonNotSupported();

  switch (es) {
    case ExchangesSupported.Coinbase:
      const onlineFillsByAccount = await FillService.getFillsListedByAccounts();
      fills.push(
        ...onlineFillsByAccount
          .reduce<FillArray>(
            (fills, current) => [
              ...fills,
              ...current.fills.map((fill) => ({
                portfolio: current.account.profile_id,
                tradeId: Number(fill.trade_id),
                product: fill.product_id,
                side: fill.side.toUpperCase() as FillSideEnum,
                createdAt: new Date(fill.created_at),
                fiatUnit: `USD`,
                size: Number(fill.size),
                sizeUnit: current.account.currency,
                price: Number(fill.price),
                fee: Number(fill.fee),
                total: Number(fill.usd_volume),
              })),
            ],
            new FillArray()
          )
          .filter((x) => !fillsIgnoreJson.includes(x.tradeId))
      );

      fills.push(
        ...fillsPushJson.map(
          (x): Fill => ({
            portfolio: x.portfolio,
            tradeId: Number(x.tradeId),
            product: x.product,
            side: x.side.toUpperCase() as FillSideEnum,
            createdAt: new Date(x.createdAt),
            fiatUnit: `USD`,
            size: x.size,
            sizeUnit: x.sizeUnit,
            price: x.price,
            fee: x.fee,
            total: x.total,
          })
        )
      );
      break;

    default:
      throw new Error(`Not supported Exchange`); // TODO: Set in errors
  }

  reportPositions(fills);
}
