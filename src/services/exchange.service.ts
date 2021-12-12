import { Account, AccountHistory, Product, Fill } from "coinbase-pro-node";

import { coinbase } from "../exchanges/conibase.exchange";
import { roundByDecimals } from "../utils/math.utils";

// TODO: Deal with pagination

export class AccountService {
  static async listAccounts(): Promise<Account[]> {
    const accounts = await coinbase.rest.account.listAccounts();
    return accounts.filter((x) => roundByDecimals(Number(x.balance), 8) > 0);
  }

  // static async getAccountHistory(accountId: string): Promise<AccountHistory[]> {
  //   return (await coinbase.rest.account.getAccountHistory(accountId)).data;
  // }

  // static async getAccountsHistory(): Promise<AccountHistory[]> {
  //   const accounts = await AccountService.listAccounts();
  //   const accountsHistory = await Promise.all(
  //     accounts.map(async (x) => await AccountService.getAccountHistory(x.id))
  //   );
  //   return accountsHistory.reduce<AccountHistory[]>((a, x) => [...a, ...x], []);
  // }
}

export class ProductService {
  static async getProducts() {
    const products = await coinbase.rest.product.getProducts();
    return products.filter((x) => !x.trading_disabled && x.status === `online`);
  }

  static async getProductsMappedByAccounts() {
    const accounts = await AccountService.listAccounts();
    const products = await ProductService.getProducts();

    return accounts.reduce<Map<string, { account: Account; products: Product[] }>>((x, account) => {
      if (x.has(account.currency))
        throw new Error(`Cannot have duplicate accounts`); // TODO
      return x.set(account.currency, {
        account,
        products: products.filter(
          (y) => y.base_currency === account.currency
        ),
      });
    }, new Map());
  }
}

export class FillService {
  static async getFillsByProductId(productId: string) {
    return (await coinbase.rest.fill.getFillsByProductId(productId)).data;
  }

  static async getFillsListedByAccounts() {
    const productsByAccount = await ProductService.getProductsMappedByAccounts();
    
    const fillsByAccount: { account: Account; fills: Fill[] }[] = [];
    
    for (const productByAccount of productsByAccount.values()) {
      const _fillsByAccount = await Promise.all(
        productByAccount.products.map((x) =>
          FillService.getFillsByProductId(x.id)
        )
      );
      fillsByAccount.push({
        account: productByAccount.account,
        fills: _fillsByAccount.reduce((a, x) => [...a, ...x], []),
      });
    }

    return fillsByAccount;
  }
}
