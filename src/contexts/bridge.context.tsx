import { BigNumber, ContractTransaction, constants as ethersConstants } from "ethers";
import { createContext, FC, useContext, useEffect, useState, useCallback } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Bridge, Claim, ClaimStatus, MerkleProof } from "src/domain";
import { Bridge as BridgeContract, Bridge__factory } from "src/types/contracts/bridge";
import * as bridgeApi from "src/adapters/bridge-api";
import { Erc20__factory } from "src/types/contracts/erc-20";

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
  bridge: (
    token: string,
    amount: BigNumber,
    destinationNetwork: number,
    destinationAddress: string
  ) => Promise<ContractTransaction>;
  claim: (
    originalTokenAddress: string,
    amount: BigNumber,
    originalNetwork: string,
    destinationNetwork: number,
    destinationAddress: string,
    smtProof: string[],
    globalExitRootNum: number,
    mainnetExitRoot: string,
    rollupExitRoot: string
  ) => Promise<ContractTransaction>;
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
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC = (props) => {
  const env = useEnvContext();
  const { connectedProvider, account } = useProvidersContext();
  const [bridgeContract, setBridgeContract] = useState<BridgeContract>();

  const getBridges = useCallback(
    ({ ethereumAddress }: GetBridgesParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getBridges({ apiUrl: env.bridgeConfig.apiUrl, ethereumAddress });
    },
    [env]
  );

  const getClaimStatus = useCallback(
    ({ originNetwork, depositCount }: GetClaimStatusParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getClaimStatus({
        apiUrl: env.bridgeConfig.apiUrl,
        originNetwork,
        depositCount,
      });
    },
    [env]
  );

  const getMerkleProof = useCallback(
    ({ originNetwork, depositCount }: GetMerkleProofParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getMerkleProof({
        apiUrl: env.bridgeConfig.apiUrl,
        originNetwork,
        depositCount,
      });
    },
    [env]
  );

  const getClaims = useCallback(
    ({ ethereumAddress }: GetClaimsParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getClaims({ apiUrl: env.bridgeConfig.apiUrl, ethereumAddress });
    },
    [env]
  );

  const bridge = useCallback(
    async (
      token: string,
      amount: BigNumber,
      destinationNetwork: number,
      destinationAddress: string
    ): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Environment is not available");
      }

      if (bridgeContract === undefined) {
        throw new Error("Bridge contract is not available");
      }

      if (token === ethersConstants.AddressZero) {
        return bridgeContract.bridge(token, amount, destinationNetwork, destinationAddress, {
          value: amount,
        });
      } else {
        if (connectedProvider === undefined) {
          throw new Error("There is no Ethereum provider connected");
        }

        if (account.status !== "successful") {
          throw new Error("The account address is not available");
        }

        const erc20Contract = Erc20__factory.connect(token, connectedProvider.getSigner());
        const allowance = await erc20Contract.allowance(
          account.data,
          env.bridgeConfig.l1ContractAddress
        );

        if (allowance.lt(amount)) {
          await erc20Contract.approve(env.bridgeConfig.l1ContractAddress, amount);
        }
      }

      return bridgeContract.bridge(token, amount, destinationNetwork, destinationAddress);
    },
    [env, bridgeContract, connectedProvider, account]
  );

  const claim = useCallback(
    async (
      originalTokenAddress: string,
      amount: BigNumber,
      originalNetwork: string,
      destinationNetwork: number,
      destinationAddress: string,
      smtProof: string[],
      globalExitRootNum: number,
      mainnetExitRoot: string,
      rollupExitRoot: string
    ): Promise<ContractTransaction> => {
      if (bridgeContract === undefined) {
        throw new Error("Bridge contract is not available");
      }

      const filter = bridgeContract.filters.ClaimEvent(null, null, null, null, null);
      const events = await bridgeContract.queryFilter(filter, 0, "latest");
      const index = events.length;

      return bridgeContract.claim(
        originalTokenAddress,
        amount,
        originalNetwork,
        destinationNetwork,
        destinationAddress,
        smtProof,
        index,
        globalExitRootNum,
        mainnetExitRoot,
        rollupExitRoot
      );
    },
    [bridgeContract]
  );

  useEffect(() => {
    if (env && connectedProvider) {
      const contract = Bridge__factory.connect(
        env.bridgeConfig.l1ContractAddress,
        connectedProvider.getSigner()
      );

      setBridgeContract(contract);
    }
  }, [env, connectedProvider]);

  return (
    <bridgeContext.Provider
      value={{ getBridges, getClaimStatus, getMerkleProof, getClaims, bridge, claim }}
      {...props}
    />
  );
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
