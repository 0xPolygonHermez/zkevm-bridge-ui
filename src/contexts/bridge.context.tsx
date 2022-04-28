import {
  BigNumber,
  ContractTransaction,
  constants as ethersConstants,
  PayableOverrides,
} from "ethers";
import { createContext, FC, useContext, useCallback } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Bridge, Chain, Claim, ClaimStatus, MerkleProof, Token } from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import * as bridgeApi from "src/adapters/bridge-api";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { BRIDGE_CALL_GAS_INCREASE } from "src/constants";
import { parseUnits } from "ethers/lib/utils";

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

interface EstimateBridgeGasPriceParams {
  chain: Chain;
  token: Token;
  destinationChain: Chain;
  destinationAddress: string;
}

interface BridgeParams {
  chain: Chain;
  token: Token;
  amount: BigNumber;
  destinationChain: Chain;
  destinationAddress: string;
}

interface ClaimParams {
  chain: Chain;
  originalTokenAddress: string;
  amount: BigNumber;
  originalNetwork: string;
  destinationNetwork: number;
  destinationAddress: string;
  index: number;
  smtProof: string[];
  globalExitRootNum: number;
  mainnetExitRoot: string;
  rollupExitRoot: string;
}

interface BridgeContext {
  getBridges: (params: GetBridgesParams) => Promise<Bridge[]>;
  getClaimStatus: (params: GetClaimStatusParams) => Promise<ClaimStatus>;
  getMerkleProof: (params: GetMerkleProofParams) => Promise<MerkleProof>;
  getClaims: (params: GetClaimsParams) => Promise<Claim[]>;
  estimateBridgeGasPrice: (params: EstimateBridgeGasPriceParams) => Promise<BigNumber>;
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
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
  estimateBridgeGasPrice: () => {
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
  const { connectedProvider, account, estimateGasPrice } = useProvidersContext();

  const getBridges = useCallback(
    ({ ethereumAddress }: GetBridgesParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getBridges({ apiUrl: env.bridge.apiUrl, ethereumAddress });
    },
    [env]
  );

  const getClaimStatus = useCallback(
    ({ originNetwork, depositCount }: GetClaimStatusParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getClaimStatus({
        apiUrl: env.bridge.apiUrl,
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
        apiUrl: env.bridge.apiUrl,
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

      return bridgeApi.getClaims({ apiUrl: env.bridge.apiUrl, ethereumAddress });
    },
    [env]
  );

  const estimateBridgeGasPrice = useCallback(
    ({ chain, token, destinationChain, destinationAddress }: EstimateBridgeGasPriceParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      const amount = parseUnits("1", token.address);
      const contract =
        chain.name === "ethereum"
          ? Bridge__factory.connect(env.bridge.l1ContractAddress, chain.provider)
          : Bridge__factory.connect(env.bridge.l2ContractAddress, chain.provider);
      const overrides: PayableOverrides =
        token.address === ethersConstants.AddressZero ? { value: amount } : {};

      if (contract === undefined) {
        throw new Error("Bridge contract is not available");
      }

      return contract.estimateGas
        .bridge(token.address, amount, destinationChain.bridgeNetworkId, destinationAddress, {
          ...overrides,
          from: destinationAddress,
        })
        .then((gasLimit) => {
          const gasIncrease = gasLimit.div(BRIDGE_CALL_GAS_INCREASE).toNumber();
          const safeGasUnits = gasLimit.add(gasIncrease);

          return estimateGasPrice({ chain, gasUnits: safeGasUnits });
        });
    },
    [env, estimateGasPrice]
  );

  const bridge = useCallback(
    async ({
      chain,
      token,
      amount,
      destinationChain,
      destinationAddress,
    }: BridgeParams): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Environment is not available");
      }

      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract =
        chain.name === "ethereum"
          ? Bridge__factory.connect(env.bridge.l1ContractAddress, connectedProvider.getSigner())
          : Bridge__factory.connect(env.bridge.l2ContractAddress, connectedProvider.getSigner());
      const overrides: PayableOverrides =
        token.address === ethersConstants.AddressZero ? { value: amount } : {};

      if (token.address !== ethersConstants.AddressZero) {
        if (account.status !== "successful") {
          throw new Error("The account address is not available");
        }

        const erc20Contract = Erc20__factory.connect(token.address, connectedProvider.getSigner());
        const allowance = await erc20Contract.allowance(account.data, env.bridge.l1ContractAddress);

        if (allowance.lt(amount)) {
          await erc20Contract.approve(env.bridge.l2ContractAddress, amount);
        }
      }

      return contract.bridge(
        token.address,
        amount,
        destinationChain.bridgeNetworkId,
        destinationAddress,
        overrides
      );
    },
    [env, connectedProvider, account]
  );

  const claim = useCallback(
    async ({
      chain,
      originalTokenAddress,
      amount,
      originalNetwork,
      destinationNetwork,
      destinationAddress,
      index,
      smtProof,
      globalExitRootNum,
      mainnetExitRoot,
      rollupExitRoot,
    }: ClaimParams): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Environment is not available");
      }

      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract =
        chain.name === "ethereum"
          ? Bridge__factory.connect(env.bridge.l1ContractAddress, connectedProvider.getSigner())
          : Bridge__factory.connect(env.bridge.l2ContractAddress, connectedProvider.getSigner());

      return contract.claim(
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
    [env, connectedProvider]
  );

  return (
    <bridgeContext.Provider
      value={{
        getBridges,
        getClaimStatus,
        getMerkleProof,
        getClaims,
        estimateBridgeGasPrice,
        bridge,
        claim,
      }}
      {...props}
    />
  );
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
