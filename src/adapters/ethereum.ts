import { z } from "zod";
import { Web3Provider } from "@ethersproject/providers";

import { StrictSchema } from "src/utils/type-safety";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

export { ethereumAccountsParser, getConnectedAccounts };
