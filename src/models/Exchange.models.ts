export interface FillProps {
  side: FillSideEnum,
  size: number,
  sizeUnit: string,
  price: number;
  fee: number;
  total: number;
}

export interface Fill extends FillProps {
  portfolio: string;
  tradeId: number;
  product: string;
  side: FillSideEnum;
  createdAt: Date;
  fiatUnit: string;
}

export enum FillSideEnum {
  BUY = `BUY`,
  SELL = `SELL`,
}

export class FillArray extends Array<Fill> {}

