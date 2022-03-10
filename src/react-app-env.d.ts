/// <reference types="react-scripts" />

import { MetaMaskProvider } from "./domain";

declare global {
  interface Window {
    ethereum?: MetaMaskProvider;
  }
}
