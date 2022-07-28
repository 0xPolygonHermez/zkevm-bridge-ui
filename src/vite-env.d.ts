/// <reference types="vite/client" />
/// <reference types="react-scripts" />

import { ExternalProvider, TransactionResponse } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

declare module "@ethersproject/providers" {
  interface BaseProvider {
    getTransaction(transactionHash: string): Promise<TransactionResponse | null>;
  }
}
