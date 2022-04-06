import { createContext, FC, useCallback, useContext } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { Bridge, Claim, ClaimStatus, MerkleProof } from "src/domain";
import * as api from "src/adapters/bridge-api";

interface GetBridgesParams {
  ethereumAddress: string;
}

interface GetClaimStatusParams {
  originNetwork: number;
  depositCount: number;
}

interface GetMerkleProofParams {
  originNetwork: number;
  depositCount: number;
}

interface GetClaimsParams {
  ethereumAddress: string;
}

interface BridgeContext {
  getBridges: (params: GetBridgesParams) => Promise<Bridge[]>;
  getClaimStatus: (params: GetClaimStatusParams) => Promise<ClaimStatus>;
  getMerkleProof: (params: GetMerkleProofParams) => Promise<MerkleProof>;
  getClaims: (params: GetClaimsParams) => Promise<Claim[]>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  getBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getClaimStatus: () => {
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
        throw new Error("Env is not available");
      }

      return api.getBridges({ env, ethereumAddress });
    },
    [env]
  );

  const getClaimStatus = useCallback(
    ({ originNetwork, depositCount }: GetClaimStatusParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return api.getClaimStatus({ env, originNetwork, depositCount });
    },
    [env]
  );

  const getMerkleProof = useCallback(
    ({ originNetwork, depositCount }: GetMerkleProofParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return api.getMerkleProof({ env, originNetwork, depositCount });
    },
    [env]
  );

  const getClaims = useCallback(
    ({ ethereumAddress }: GetClaimsParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return api.getClaims({ env, ethereumAddress });
    },
    [env]
  );

  return (
    <bridgeContext.Provider
      value={{ getBridges, getClaimStatus, getMerkleProof, getClaims }}
      {...props}
    />
  );
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
