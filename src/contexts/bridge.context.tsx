import {
  BigNumber,
  ContractTransaction,
  constants as ethersConstants,
  PayableOverrides,
} from "ethers";
import { createContext, FC, useContext, useCallback } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Transaction, Chain, Token } from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import * as bridgeApi from "src/adapters/bridge-api";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { BRIDGE_CALL_GAS_INCREASE_PERCENTAGE } from "src/constants";
import { parseUnits } from "ethers/lib/utils";

interface GetTransactionsParams {
  ethereumAddress: string;
}

interface EstimateBridgeGasPriceParams {
  from: Chain;
  token: Token;
  to: Chain;
  destinationAddress: string;
}

interface BridgeParams {
  from: Chain;
  token: Token;
  amount: BigNumber;
  to: Chain;
  destinationAddress: string;
}

interface ClaimParams {
  originalTokenAddress: string;
  amount: BigNumber;
  originalNetwork: string;
  destinationNetwork: Chain;
  destinationAddress: string;
  index: number;
  smtProof: string[];
  globalExitRootNum: number;
  mainnetExitRoot: string;
  rollupExitRoot: string;
}

interface BridgeContext {
  getTransactions: (params: GetTransactionsParams) => Promise<Transaction[]>;
  estimateBridgeGasPrice: (params: EstimateBridgeGasPriceParams) => Promise<BigNumber>;
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  getTransactions: () => {
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
  const { connectedProvider, account } = useProvidersContext();

  const getTransactions = useCallback(
    ({ ethereumAddress }: GetTransactionsParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      return bridgeApi.getTransactions({ env, ethereumAddress });
    },
    [env]
  );

  const estimateGasPrice = useCallback(
    ({ chain, gasLimit }: { chain: Chain; gasLimit: BigNumber }): Promise<BigNumber> => {
      return chain.provider.getFeeData().then((feeData) => {
        if (feeData.maxFeePerGas !== null) {
          return gasLimit.mul(feeData.maxFeePerGas);
        } else if (feeData.gasPrice !== null) {
          return gasLimit.mul(feeData.gasPrice);
        } else {
          throw new Error("Fee data is not available");
        }
      });
    },
    []
  );

  const estimateBridgeGasPrice = useCallback(
    ({ from, token, to, destinationAddress }: EstimateBridgeGasPriceParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      const amount = parseUnits("1", token.address);
      const contract =
        from.key === "ethereum"
          ? Bridge__factory.connect(env.bridge.l1ContractAddress, from.provider)
          : Bridge__factory.connect(env.bridge.l2ContractAddress, from.provider);
      const overrides: PayableOverrides =
        token.address === ethersConstants.AddressZero ? { value: amount } : {};

      if (contract === undefined) {
        throw new Error("Bridge contract is not available");
      }

      return contract.estimateGas
        .bridge(token.address, amount, to.networkId, destinationAddress, {
          ...overrides,
          from: destinationAddress,
        })
        .then((gasLimit) => {
          const gasIncrease = gasLimit.div(BRIDGE_CALL_GAS_INCREASE_PERCENTAGE);
          const safeGasLimit = gasLimit.add(gasIncrease);

          return estimateGasPrice({ chain: from, gasLimit: safeGasLimit });
        });
    },
    [env, estimateGasPrice]
  );

  const bridge = useCallback(
    async ({
      from,
      token,
      amount,
      to,
      destinationAddress,
    }: BridgeParams): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract =
        from.key === "ethereum"
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

      return contract.bridge(token.address, amount, to.networkId, destinationAddress, overrides);
    },
    [env, connectedProvider, account]
  );

  const claim = useCallback(
    async ({
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
        throw new Error("Env is not available");
      }

      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract =
        destinationNetwork.key === "ethereum"
          ? Bridge__factory.connect(env.bridge.l1ContractAddress, connectedProvider.getSigner())
          : Bridge__factory.connect(env.bridge.l2ContractAddress, connectedProvider.getSigner());

      return contract.claim(
        originalTokenAddress,
        amount,
        originalNetwork,
        destinationNetwork.networkId,
        destinationAddress,
        smtProof,
        index,
        globalExitRootNum,
        mainnetExitRoot,
        rollupExitRoot,
        destinationNetwork.key === "polygon-hermez" ? { gasPrice: 0 } : undefined
      );
    },
    [env, connectedProvider]
  );

  return (
    <bridgeContext.Provider
      value={{
        getTransactions,
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
