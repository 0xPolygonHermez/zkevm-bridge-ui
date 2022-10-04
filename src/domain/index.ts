import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

export type ChainKey = "ethereum" | "polygon-zkevm";

export interface Chain {
  key: ChainKey;
  Icon: ComponentType<{ className?: string }>;
  provider: JsonRpcProvider;
  networkId: number;
  chainId: number;
  contractAddress: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
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
  chains: [Chain, Chain];
  fiatExchangeRates:
    | {
        areEnabled: false;
      }
    | {
        areEnabled: true;
        apiUrl: string;
        apiKey: string;
        usdcToken: Token;
      };
}

export interface RouterState {
  redirectUrl: string;
}

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

export enum TxStatus {
  REVERTED = 0,
  SUCCESSFUL = 1,
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

export type Bridge = PendingBridge | InitiatedBridge | OnHoldBridge | CompletedBridge;

export type PendingBridge = {
  status: "pending";
  depositTxHash: BridgeCommonFields["depositTxHash"];
  claimTxHash?: CompletedBridge["claimTxHash"];
  key: ChainKey;
  from: BridgeCommonFields["from"];
  to: BridgeCommonFields["to"];
  token: BridgeCommonFields["token"];
  amount: BridgeCommonFields["amount"];
  fiatAmount: BridgeCommonFields["fiatAmount"];
};

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

export interface FormData {
  from: Chain;
  to: Chain;
  token: Token;
  amount: BigNumber;
}
