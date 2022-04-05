import { createContext, FC, useCallback, useContext } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { Bridge, Claim, MerkleProof } from "src/domain";
import * as api from "src/adapters/bridge-api";

interface GetBridgesParams {
  ethereumAddress: string;
}

interface GetClaimsParams {
  ethereumAddress: string;
}

interface GetMerkleProofParams {
  originNetwork: number;
  depositCount: number;
}

interface BridgeContext {
  getBridges: (params: GetBridgesParams) => Promise<Bridge[]>;
  getMerkleProof: (params: GetMerkleProofParams) => Promise<MerkleProof>;
  getClaims: (params: GetClaimsParams) => Promise<Claim[]>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  getBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getMerkleProof: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getClaims: () => {
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

  const getMerkleProof = useCallback(
    ({ originNetwork, depositCount }: GetMerkleProofParams) => {
      if (env === undefined) {
        throw new Error("The bridge API client couldn't be instantiated");
      }

      return api.getMerkleProof({ env, originNetwork, depositCount });
    },
    [env]
  );

  const getClaims = useCallback(
    ({ ethereumAddress }: GetClaimsParams) => {
      if (env === undefined) {
        throw new Error("The bridge API client couldn't be instantiated");
      }

      return api.getClaims({ env, ethereumAddress });
    },
    [env]
  );

  return <bridgeContext.Provider value={{ getBridges, getMerkleProof, getClaims }} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
