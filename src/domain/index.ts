export enum WalletName {
  METAMASK,
  WALLET_CONNECT,
}

export enum MetaMaskEvent {
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
}

export interface Env {
  REACT_APP_INFURA_API_KEY: string;
}
