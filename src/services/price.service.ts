import undici from "undici";
import { Price } from "./../models/Price.model";

export async function getPriceBySymbol(symbol: string): Promise<Price> {
  const ed = await undici.request(
    `https://api.coincap.io/v2/assets?search=${symbol}`
  );

  const bj = await ed.body.json();
  const priceObj = bj.data.find((y: any) => y.symbol === symbol);

  if (!priceObj) throw new Error(`Price for symbol ${symbol} not found.`);

  return priceObj;
}
