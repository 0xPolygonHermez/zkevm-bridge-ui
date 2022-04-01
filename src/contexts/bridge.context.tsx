import { BigNumber, ContractTransaction, Overrides, PayableOverrides, CallOverrides } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Bridge, Bridge__factory } from "src/types/contracts/bridge/bridge";
import {
  GlobalExitRootManager,
  GlobalExitRootManager__factory,
} from "src/types/contracts/bridge/global-exit-root-manager";

interface BridgeContext {
  bridge: (
    token: string,
    amount: BigNumber,
    destinationNetwork: number,
    destinationAddress: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ) => Promise<ContractTransaction>;
  claim: (
    originalTokenAddress: string,
    amount: BigNumber,
    originalNetwork: number,
    destinationNetwork: number,
    destinationAddress: string,
    smtProof: string[],
    index: number,
    globalExitRootNum: number,
    mainnetExitRoot: string,
    rollupExitRoot: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ) => Promise<ContractTransaction>;
  lastMainnetExitRoot: (overrides?: CallOverrides) => Promise<string>;
  lastGlobalExitRootNum: (overrides?: CallOverrides) => Promise<BigNumber>;
  updateExitRoot: (
    newRoot: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ) => Promise<ContractTransaction>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  lastMainnetExitRoot: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  lastGlobalExitRootNum: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  updateExitRoot: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC = (props) => {
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();
  const [bridgeContract, setBridgeContract] = useState<Bridge>();
  const [globalExitRootManagerContract, setGlobalExitRootManagerContract] =
    useState<GlobalExitRootManager>();

  const bridge = (
    token: string,
    amount: BigNumber,
    destinationNetwork: number,
    destinationAddress: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (bridgeContract === undefined) {
      throw new Error("Bridge contract is not available");
    }

    return bridgeContract.bridge(token, amount, destinationNetwork, destinationAddress, overrides);
  };

  const claim = (
    originalTokenAddress: string,
    amount: BigNumber,
    originalNetwork: number,
    destinationNetwork: number,
    destinationAddress: string,
    smtProof: string[],
    index: number,
    globalExitRootNum: number,
    mainnetExitRoot: string,
    rollupExitRoot: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (bridgeContract === undefined) {
      throw new Error("Bridge contract is not available");
    }

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
      rollupExitRoot,
      overrides
    );
  };

  const lastMainnetExitRoot = (overrides?: CallOverrides): Promise<string> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (globalExitRootManagerContract === undefined) {
      throw new Error("GlobalExitRootManager contract is not available");
    }

    return globalExitRootManagerContract.lastMainnetExitRoot(overrides);
  };

  const lastGlobalExitRootNum = (overrides?: CallOverrides): Promise<BigNumber> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (globalExitRootManagerContract === undefined) {
      throw new Error("GlobalExitRootManager contract is not available");
    }
    return globalExitRootManagerContract.lastGlobalExitRootNum(overrides);
  };

  const updateExitRoot = (
    newRoot: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (globalExitRootManagerContract === undefined) {
      throw new Error("GlobalExitRootManager contract is not available");
    }
    return globalExitRootManagerContract.updateExitRoot(newRoot, overrides);
  };

  useEffect(() => {
    if (env && connectedProvider) {
      const bridgeContractInstance = Bridge__factory.connect(
        env.REACT_APP_BRIDGE_CONTRACT_ADDRESS,
        connectedProvider.getSigner()
      );
      setBridgeContract(bridgeContractInstance);

      const globalExitRootManagerContractInstance = GlobalExitRootManager__factory.connect(
        env.REACT_APP_GLOBAL_EXIT_ROOT_MANAGER_CONTRACT_ADDRESS,
        connectedProvider
      );
      setGlobalExitRootManagerContract(globalExitRootManagerContractInstance);
    }
  }, [env, connectedProvider]);

  return (
    <bridgeContext.Provider
      value={{ bridge, claim, lastMainnetExitRoot, lastGlobalExitRootNum, updateExitRoot }}
      {...props}
    />
  );
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
