import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface Chain {
  key: "ethereum" | "polygon-hermez";
  name: string;
  Icon: ComponentType<{ className?: string }>;
  provider: JsonRpcProvider;
  bridgeNetworkId: number;
}
export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export interface Env {
  bridge: {
    apiUrl: string;
    l1ContractAddress: string;
    l2ContractAddress: string;
  };
  tokenQuotes: {
    uniswapQuoterContractAddress: string;
  };
  fiatExchangeRates: {
    apiUrl: string;
    apiKey: string;
  };
  chains: [Chain, Chain];
  tokens: {
    ETH: Token;
    USDT: Token;
  };
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

export interface ClaimStatus {
  isReady: boolean;
}

export interface MerkleProof {
  merkleProof: string[];
  exitRootNumber: string;
  mainExitRoot: string;
  rollupExitRoot: string;
}

export interface TransactionData {
  from: Chain;
  to: Chain;
  token: Token;
  amount: BigNumber;
  estimatedFee?: BigNumber;
}
