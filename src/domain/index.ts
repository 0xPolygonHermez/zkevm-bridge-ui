import { ExternalProvider, BaseProvider } from "@ethersproject/providers";

export type MetaMaskProvider = ExternalProvider & {
  on?: BaseProvider["on"];
  removeListener?: BaseProvider["removeListener"];
};

export enum WalletName {
  METAMASK,
  WALLET_CONNECT,
}

export enum EthereumEvent {
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
  DISCONNECT = "disconnect",
}

export interface Env {
  REACT_APP_INFURA_API_KEY: string;
}
