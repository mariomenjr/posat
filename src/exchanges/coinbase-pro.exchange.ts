import { CoinbasePro } from "coinbase-pro-node";

import { ExchangesConfig } from "../configs/exchange.config";

export const coinbase = new CoinbasePro(ExchangesConfig.Coinbase);
