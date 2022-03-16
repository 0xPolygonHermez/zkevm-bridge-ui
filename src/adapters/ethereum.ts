import { Web3Provider } from "@ethersproject/providers";
import { ethereumAccountsParser } from "./parsers";

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

export { getConnectedAccounts };
