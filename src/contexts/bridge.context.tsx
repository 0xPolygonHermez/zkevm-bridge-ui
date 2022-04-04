import { BigNumber, ContractTransaction, constants as ethersConstants } from "ethers";
import { createContext, FC, useContext, useEffect, useState, useCallback } from "react";

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
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC = (props) => {
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();
  const [bridgeContract, setBridgeContract] = useState<Bridge>();

  const bridge = useCallback(
    (
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

      if (token !== ethersConstants.AddressZero) {
        throw new Error("ERC-20 tokens are not yet supported");
      }

      return bridgeContract.bridge(token, amount, destinationNetwork, destinationAddress, {
        value: amount,
      });
    },
    [bridgeContract, env]
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
      if (env === undefined) {
        throw new Error("Environment is not available");
      }

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
    [bridgeContract, env]
  );

  useEffect(() => {
    if (env && connectedProvider) {
      const contract = Bridge__factory.connect(
        env.REACT_APP_BRIDGE_CONTRACT_ADDRESS,
        connectedProvider.getSigner()
      );

      setBridgeContract(contract);
    }
  }, [env, connectedProvider]);

  return <bridgeContext.Provider value={{ bridge, claim }} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
