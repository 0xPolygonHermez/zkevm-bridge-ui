export enum WalletName {
  METAMASK,
  WALLET_CONNECT,
}

export enum EthereumEvent {
  ACCOUNTS_CHANGED = "accountsChanged",
  CHAIN_CHANGED = "chainChanged",
  DISCONNECT = "disconnect",
}

export type TransactionStatus = "processing" | "initiated" | "on-hold" | "completed" | "failed";

export enum TransactionStatusText {
  PROCESSING = "Processing",
  INITIATED = "Initiated",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  FAILED = "Error",
}

export function transactionStatusText(status: TransactionStatus): TransactionStatusText {
  switch (status) {
    case "processing":
      return TransactionStatusText.PROCESSING;
    case "initiated":
      return TransactionStatusText.INITIATED;
    case "on-hold":
      return TransactionStatusText.ON_HOLD;
    case "completed":
      return TransactionStatusText.COMPLETED;
    case "failed":
      return TransactionStatusText.FAILED;
  }
}

export interface Env {
  REACT_APP_INFURA_API_KEY: string;
}
