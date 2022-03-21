export interface Env {
  REACT_APP_INFURA_API_KEY: string;
}

export interface RouterState {
  redirectUrl: string;
}

export enum WalletName {
  METAMASK = "MetaMask",
  WALLET_CONNECT = "WalletConnect",
}

export enum EthereumEvent {
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
  DISCONNECT = "disconnect",
}

export type TransactionStatus = "processing" | "initiated" | "on-hold" | "completed" | "failed";

export function getTransactionStatusText(status: TransactionStatus): string {
  switch (status) {
    case "processing":
      return "Processing";
    case "initiated":
      return "Initiated";
    case "on-hold":
      return "On Hold";
    case "completed":
      return "Completed";
    case "failed":
      return "Error";
  }
}
