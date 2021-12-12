import CsvUtils from "../utils/csv.utils";

import { FillService } from "./../services/exchange.service";
import { ExchangesSupported } from "./../configs/exchange.config";

import { reportPositions } from "./analysis.controller";

import { FillSideEnum, Fill, FillArray } from "./../models/Fill.models";

export async function executeCsv(csvPath: string): Promise<void> {
  const fills = await CsvUtils.readFills(csvPath);

  reportPositions(fills);
}

export async function executeExchange(es: ExchangesSupported): Promise<void> {
  const fills: Fill[] = [];

  switch (es) {
    case ExchangesSupported.Coinbase:
      const onlineFillsByAccount = await FillService.getFillsListedByAccounts();
      fills.push(
        ...onlineFillsByAccount.reduce<FillArray>(
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
      );
      break;

    default:
      throw new Error(`Not supported Exchange`); // TODO: Set in errors
  }

  reportPositions(fills);
}
