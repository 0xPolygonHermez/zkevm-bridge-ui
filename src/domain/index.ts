import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { AsyncTask } from "src/utils/types";

export type ChainKey = "ethereum" | "polygon-zkevm";

export interface CommonChain {
  Icon: ComponentType<{ className?: string }>;
  bridgeContractAddress: string;
  chainId: number;
  explorerUrl: string;
  key: ChainKey;
  name: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
  networkId: number;
  provider: JsonRpcProvider;
}

export type EthereumChain = CommonChain & {
  key: "ethereum";
  poeContractAddress: string;
};

export type ZkEVMChain = CommonChain & {
  key: "polygon-zkevm";
};

export type Chain = EthereumChain | ZkEVMChain;

export interface ConnectedProvider {
  account: string;
  chainId: number;
  provider: Web3Provider;
}

export interface Token {
  address: string;
  balance?: AsyncTask<BigNumber, string>;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  wrappedToken?: {
    address: string;
    chainId: number;
  };
}

export interface Env {
  bridgeApiUrl: string;
  chains: [EthereumChain, ZkEVMChain];
  fiatExchangeRates:
    | {
        areEnabled: false;
      }
    | {
        apiKey: string;
        apiUrl: string;
        areEnabled: true;
        usdcToken: Token;
      };
}

export interface RouterState {
  redirectUrl: string;
}

export enum EthereumChainId {
  MAINNET = 1,
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
  CNY = "CNY",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  USD = "USD",
}

export type FiatExchangeRates = Partial<Record<keyof typeof Currency, number>>;

// User notifications
export type Message =
  | {
      text: string;
      type: "success-msg" | "error-msg";
    }
  | {
      parsed: string;
      text?: string;
      type: "error";
    };

interface BridgeCommonFields {
  amount: BigNumber;
  depositCount: number;
  depositTxHash: string;
  destinationAddress: string;
  fiatAmount: BigNumber | undefined;
  from: Chain;
  id: string;
  to: Chain;
  token: Token;
  tokenOriginNetwork: number;
}

export type PendingBridge = Pick<
  BridgeCommonFields,
  "depositTxHash" | "destinationAddress" | "from" | "to" | "token" | "amount" | "fiatAmount"
> & {
  claimTxHash?: string;
  status: "pending";
};

export type InitiatedBridge = BridgeCommonFields & {
  status: "initiated";
};

export type OnHoldBridge = BridgeCommonFields & {
  status: "on-hold";
};

export type CompletedBridge = BridgeCommonFields & {
  claimTxHash: NonNullable<PendingBridge["claimTxHash"]>;
  status: "completed";
};

export type Bridge = PendingBridge | InitiatedBridge | OnHoldBridge | CompletedBridge;

export interface Deposit {
  amount: BigNumber;
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
  depositCount: number;
  depositTxHash: string;
  destinationAddress: string;
  fiatAmount: BigNumber | undefined;
  from: Chain;
  to: Chain;
  token: Token;
  tokenOriginNetwork: number;
}

export interface MerkleProof {
  exitRootNumber: number;
  l2ExitRootNumber: number;
  mainExitRoot: string;
  merkleProof: string[];
  rollupExitRoot: string;
}

export interface FormData {
  amount: BigNumber;
  from: Chain;
  to: Chain;
  token: Token;
}

export enum PolicyCheck {
  Checked = "checked",
  Unchecked = "unchecked",
}

export type Gas =
  | {
      data: {
        gasLimit: BigNumber;
        maxFeePerGas: BigNumber;
      };
      type: "eip-1559";
    }
  | {
      data: {
        gasLimit: BigNumber;
        gasPrice: BigNumber;
      };
      type: "legacy";
    };

export type TokenSpendPermission =
  | {
      type: "none";
    }
  | {
      type: "approval";
    }
  | {
      permit: Permit;
      type: "permit";
    };

export enum Permit {
  DAI = "DAI",
  EIP_2612 = "EIP_2612",
  UNISWAP = "UNISWAP",
}
