/// <reference types="react-scripts" />

import { ExternalProvider, BaseProvider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider & {
      on?: BaseProvider["on"];
      removeListener?: BaseProvider["removeListener"];
    };
  }
}
