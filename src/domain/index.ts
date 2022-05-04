import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface Chain {
  key: "ethereum" | "polygon-hermez";
  Icon: ComponentType<{ className?: string }>;
  provider: JsonRpcProvider;
  networkId: number;
  contractAddress: string;
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
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
  | (InitiatedTransaction & {
      status: "initiated";
    })
  | (InitiatedTransaction &
      MerkleProof & {
        status: "on-hold";
      })
  | (InitiatedTransaction &
      MerkleProof &
      Claim & {
        status: "completed";
      });

export interface InitiatedTransaction {
  id: string;
  token: Token;
  amount: BigNumber;
  networkId: number;
  originNetwork: Chain;
  destinationNetwork: Chain;
  destinationAddress: string;
  depositCount: number;
}

export interface Bridge {
  tokenAddress: string;
  amount: BigNumber;
  networkId: number;
  originNetwork: number;
  destinationNetwork: number;
  destinationAddress: string;
  depositCount: number;
}

export interface Claim {
  index: number;
  blockNumber: string;
}

export interface ClaimStatus {
  isReady: boolean;
}

export interface MerkleProof {
  merkleProof: string[];
  exitRootNumber: number;
  l2ExitRootNumber: number;
  mainExitRoot: string;
  rollupExitRoot: string;
}

export interface TransactionData {
  from: Chain;
  to: Chain;
  token: Token;
  amount: BigNumber;
  estimatedFee: BigNumber;
}
