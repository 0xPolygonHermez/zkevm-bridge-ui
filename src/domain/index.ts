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
