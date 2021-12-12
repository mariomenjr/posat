import { ClientAuthenticationBaseUrls } from "coinbase-pro-node";

export class ExchangesConfig {
  static get Coinbase(): ClientAuthenticationBaseUrls {
    return {
      apiKey: `${process.env.CB_API_KEY}`,
      apiSecret: `${process.env.CB_API_SECRET}`,
      passphrase: `${process.env.CB_PASSPHRASE}`,
      useSandbox: false,
    };
  }
}
