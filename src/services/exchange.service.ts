import { coinbase } from "../exchanges/conibase.exchange";

export async function getAccountHistory() {
  return coinbase.rest.account.getAccountHistory(
    `577f9c47-8e5a-4047-bf5e-55ac40af233b`
  );
}
