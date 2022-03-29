import { BigNumber, ContractTransaction } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Bridge, Bridge__factory } from "src/types/contracts/bridge";

interface BridgeContext {
  bridge: (
    token: string,
    amount: BigNumber,
    destinationNetwork: number,
    destinationAddress: string
  ) => Promise<ContractTransaction>;
  claim: (
    originalTokenAddress: string,
    amount: BigNumber,
    originalNetwork: number,
    destinationNetwork: number,
    destinationAddress: string,
    smtProof: string[],
    index: BigNumber,
    globalExitRootNum: number,
    mainnetExitRoot: string,
    rollupExitRoot: string
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
});

const BridgeProvider: FC = (props) => {
  const env = useEnvContext();
  const { l1Provider } = useProvidersContext();
  const [bridgeContract, setBridgeContract] = useState<Bridge>();

  const bridge = (
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

    return bridgeContract.bridge(token, amount, destinationNetwork, destinationAddress);
  };

  const claim = (
    originalTokenAddress: string,
    amount: BigNumber,
    originalNetwork: number,
    destinationNetwork: number,
    destinationAddress: string,
    smtProof: string[],
    index: BigNumber,
    globalExitRootNum: number,
    mainnetExitRoot: string,
    rollupExitRoot: string
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
      rollupExitRoot
    );
  };

  useEffect(() => {
    if (env && l1Provider) {
      const contract = Bridge__factory.connect(env.REACT_APP_BRIDGE_CONTRACT_ADDRESS, l1Provider);

      setBridgeContract(contract);
    }
  }, [env, l1Provider]);

  return <bridgeContext.Provider value={{ bridge, claim }} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
