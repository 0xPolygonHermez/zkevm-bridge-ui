import { BigNumber } from "ethers";
import { ComponentType } from "react";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { AsyncTask } from "src/utils/types";

export type ChainKey = "ethereum" | "polygon-zkevm";

export interface CommonChain {
  key: ChainKey;
  name: string;
  Icon: ComponentType<{ className?: string }>;
  provider: JsonRpcProvider;
  networkId: number;
  chainId: number;
  bridgeContractAddress: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
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
  provider: Web3Provider;
  chainId: number;
  account: string;
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  balance?: AsyncTask<BigNumber, string>;
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

export type PendingBridge = Pick<
  BridgeCommonFields,
  "depositTxHash" | "destinationAddress" | "from" | "to" | "token" | "amount" | "fiatAmount"
> & {
  status: "pending";
  claimTxHash?: string;
};

export type InitiatedBridge = BridgeCommonFields & {
  status: "initiated";
};

export type OnHoldBridge = BridgeCommonFields & {
  status: "on-hold";
};

export type CompletedBridge = BridgeCommonFields & {
  status: "completed";
  claimTxHash: NonNullable<PendingBridge["claimTxHash"]>;
};

export type Bridge = PendingBridge | InitiatedBridge | OnHoldBridge | CompletedBridge;

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

export enum PolicyCheck {
  Checked = "checked",
  Unchecked = "unchecked",
}

export type Gas =
  | {
      type: "eip-1559";
      data: {
        gasLimit: BigNumber;
        maxFeePerGas: BigNumber;
      };
    }
  | {
      type: "legacy";
      data: {
        gasLimit: BigNumber;
        gasPrice: BigNumber;
      };
    };

export type TokenSpendPermission =
  | {
      type: "none";
    }
  | {
      type: "approve";
    }
  | {
      type: "permit";
      permit: Permit;
    };

export enum Permit {
  DAI = "DAI",
  EIP_2612_STANDARD = "EIP_2612_STANDARD",
  EIP_2612_UNISWAP = "EIP_2612_UNISWAP",
}
