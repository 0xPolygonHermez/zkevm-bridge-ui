import { Web3Provider } from "@ethersproject/providers";
import { ethereumAccountsParser } from "./parsers";

const getAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

export { getAccounts };
