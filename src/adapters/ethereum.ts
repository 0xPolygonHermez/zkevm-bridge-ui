import { Web3Provider } from "@ethersproject/providers";
import { ethereumAccountsParser } from "src/adapters/parsers";

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

export { getConnectedAccounts };
