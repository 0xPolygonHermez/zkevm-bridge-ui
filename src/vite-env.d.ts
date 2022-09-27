/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { ExternalProvider, TransactionResponse } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }

  const bridgeVersion: string;
}

declare module "@ethersproject/providers" {
  interface BaseProvider {
    getTransaction(transactionHash: string): Promise<TransactionResponse | null>;
  }
}
