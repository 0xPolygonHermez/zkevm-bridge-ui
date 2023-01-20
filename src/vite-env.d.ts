/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import {
  TransactionReceipt,
  TransactionResponse,
  TypeSafeTransactionReceipt,
  TypeSafeTransactionResponse,
} from "@ethersproject/abstract-provider";
import { ExternalProvider } from "@ethersproject/providers";

type Nullable<Type> = {
  [Property in keyof Type]: Type[Property] | null;
};

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }

  const bridgeVersion: string;
}

// Module augmentation does not allow changing the types of existing properties (https://github.com/microsoft/TypeScript/issues/36146)
// but the types of Ethers v5 are broken (https://github.com/ethers-io/ethers.js/issues/2325#issuecomment-977620740), so we provide here
// a typesafe version of the types and functions that we use in this project

declare module "@ethersproject/abstract-provider" {
  type TypeSafeTransactionResponse = Nullable<TransactionResponse>;
  type TypeSafeTransactionReceipt = Nullable<TransactionReceipt>;
}

declare module "@ethersproject/providers" {
  interface BaseProvider {
    getTransaction(transactionHash: string): Promise<TypeSafeTransactionResponse | null>;
    getTransactionReceipt(transactionHash: string): Promise<TypeSafeTransactionReceipt | null>;
  }
}
