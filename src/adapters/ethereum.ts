import { z } from "zod";
import { Web3Provider, Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

import { StrictSchema } from "src/utils/type-safety";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

const getBalance = (provider: Provider, account: string): Promise<BigNumber> =>
  provider.getBalance(account);

export { ethereumAccountsParser, getConnectedAccounts, getBalance };
