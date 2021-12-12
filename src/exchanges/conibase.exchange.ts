import { CoinbasePro } from "coinbase-pro-node";

import { ExchangesConfig } from "./../utils/env.utils";

export const coinbase = new CoinbasePro(ExchangesConfig.Coinbase);
