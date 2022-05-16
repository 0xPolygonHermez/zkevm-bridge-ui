import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface Chain {
  key: "ethereum" | "polygon-hermez";
  Icon: ComponentType<{ className?: string }>;
  provider: JsonRpcProvider;
  networkId: number;
  chainId: number;
  contractAddress: string;
  explorerUrl: string;
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
  network: number;
  decimals: number;
  logoURI: string;
}

export interface Env {
  bridgeApiUrl: string;
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
  version: string;
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

export type Transaction =
  | {
      status: "initiated";
      id: string;
      bridge: Bridge;
    }
  | {
      status: "on-hold";
      id: string;
      bridge: Bridge;
      merkleProof: MerkleProof;
    }
  | {
      status: "completed";
      id: string;
      bridge: Bridge;
      claim: Claim;
    };

export interface Bridge {
  token: Token;
  amount: BigNumber;
  networkId: Chain;
  destinationNetwork: Chain;
  destinationAddress: string;
  depositCount: number;
  txHash: string;
}

export interface Claim {
  txHash: string;
}

export interface MerkleProof {
  merkleProof: string[];
  exitRootNumber: number;
  l2ExitRootNumber: number;
  mainExitRoot: string;
  rollupExitRoot: string;
}

export interface FormData {
  from: Chain;
  to: Chain;
  token: Token;
  amount: BigNumber;
  estimatedFee: BigNumber;
}
