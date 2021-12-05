export interface Fill {
  portfolio: string;
  tradeId: number;
  product: string;
  side: FillSideEnum;
  createdAt: Date;
  size: number;
  sizeUnit: string;
  price: number;
  fee: number;
  total: number;
  fiatUnit: string;
}

export enum FillSideEnum {
  BUY = `BUY`,
  SELL = `SELL`,
}

export class FillArray extends Array<Fill> {}