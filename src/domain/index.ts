export interface Env {
  REACT_APP_INFURA_API_KEY: string;
  REACT_APP_L1_PROVIDER_NETWORK: string;
  REACT_APP_L2_PROVIDER_URL: string;
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

export enum Currencies {
  EUR = "eur",
  USD = "usd",
  JPY = "jpy",
  GBP = "gbp",
  CNY = "cny",
}

// User notifications
export type Message =
  | {
      type: "info-msg" | "success-msg" | "error-msg";
      text: string;
    }
  | {
      type: "error";
      text?: string;
      parsed: string;
    };
