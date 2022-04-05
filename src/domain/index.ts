export interface Env {
  REACT_APP_INFURA_API_KEY: string;
  REACT_APP_L1_PROVIDER_NETWORK: string;
  REACT_APP_L2_PROVIDER_URL: string;
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: string;
  REACT_APP_USDT_CONTRACT_ADDRESS: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_BRIDGE_API_URL: string;
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

export enum Currency {
  EUR = "EUR",
  USD = "USD",
  JPY = "JPY",
  GBP = "GBP",
  CNY = "CNY",
}

export type FiatExchangeRates = Partial<Record<keyof typeof Currency, number>>;

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

export interface Bridge {
  tokenAddress: string;
  amount: string;
  destinationNetwork: number;
  destinationAddress: string;
  depositCount: string;
}

export interface Claim {
  index: string;
  tokenAddress: string;
  amount: string;
  destinationNetwork: number;
  destinationAddress: string;
  blockNumber: string;
}

export interface MerkleProof {
  merkleProof: string[];
  exitRootNumber: string;
  mainExitRoot: string;
  rollupExitRoot: string;
}
