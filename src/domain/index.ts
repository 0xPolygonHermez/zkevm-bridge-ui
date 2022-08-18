import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface Chain {
  key: "ethereum" | "polygon-zkevm";
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
  decimals: number;
  chainId: number;
  logoURI: string;
  balance?: BigNumber;
  wrappedToken?: {
    address: string;
    chainId: number;
  };
}

export interface Env {
  bridgeApiUrl: string;
  fiatExchangeRates: {
    apiUrl: string;
    apiKey: string;
    usdcToken: Token;
  };
  chains: [Chain, Chain];
}

export interface FormData {
  from: Chain;
  to: Chain;
  token: Token;
  amount: BigNumber;
  estimatedFee: BigNumber;
}

// A serializable version of FormData
export interface FormDataRouterState {
  from: Chain["key"];
  to: Chain["key"];
  token: Token;
  amount: string;
  estimatedFee: string;
}

export interface RedirectRouterState {
  redirectUrl: string;
}

export type RouterState = RedirectRouterState | FormDataRouterState;

export enum EthereumChainId {
  MAINNET = 1,
  RINKEBY = 4,
  GOERLI = 5,
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
      type: "success-msg" | "error-msg";
      text: string;
    }
  | {
      type: "error";
      text?: string;
      parsed: string;
    };

interface BridgeCommonFields {
  id: string;
  token: Token;
  amount: BigNumber;
  fiatAmount: BigNumber | undefined;
  from: Chain;
  to: Chain;
  tokenOriginNetwork: number;
  destinationAddress: string;
  depositCount: number;
  depositTxHash: string;
}

export type InitiatedBridge = BridgeCommonFields & {
  status: "initiated";
};

export type OnHoldBridge = BridgeCommonFields & {
  status: "on-hold";
};

export type CompletedBridge = BridgeCommonFields & {
  status: "completed";
  claimTxHash: string;
};

export type Bridge = InitiatedBridge | OnHoldBridge | CompletedBridge;

export interface Deposit {
  token: Token;
  amount: BigNumber;
  fiatAmount: BigNumber | undefined;
  from: Chain;
  to: Chain;
  tokenOriginNetwork: number;
  destinationAddress: string;
  depositCount: number;
  depositTxHash: string;
  claim:
    | {
        status: "pending";
      }
    | {
        status: "ready";
      }
    | {
        status: "claimed";
        txHash: string;
      };
}

export interface MerkleProof {
  merkleProof: string[];
  exitRootNumber: number;
  l2ExitRootNumber: number;
  mainExitRoot: string;
  rollupExitRoot: string;
}
