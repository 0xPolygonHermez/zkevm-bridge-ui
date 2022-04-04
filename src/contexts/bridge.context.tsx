import { createContext, FC, useCallback, useContext } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { Bridge } from "src/domain";
import * as api from "src/adapters/bridge-api";

interface GetBridgesParams {
  ethereumAddress: string;
}

interface BridgeContext {
  getBridges: (params: GetBridgesParams) => Promise<Bridge[]>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  getBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC = (props) => {
  const env = useEnvContext();

  const getBridges = useCallback(
    ({ ethereumAddress }: GetBridgesParams) => {
      if (env === undefined) {
        throw new Error("The bridge API client couldn't be instantiated");
      }

      return api.getBridges({ env, ethereumAddress });
    },
    [env]
  );

  return <bridgeContext.Provider value={{ getBridges }} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
