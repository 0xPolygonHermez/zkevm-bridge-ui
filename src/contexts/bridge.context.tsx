import {
  BigNumber,
  ContractTransaction,
  constants as ethersConstants,
  PayableOverrides,
  ethers,
} from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { createContext, FC, useContext, useCallback } from "react";

import { useProvidersContext } from "src/contexts/providers.context";
import { Chain, Token } from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { BRIDGE_CALL_GAS_INCREASE_PERCENTAGE } from "src/constants";
import { calculateFee } from "src/utils/fees";

interface GetBalanceParams {
  token: Token;
  from: Chain;
  to: Chain;
  ethereumAddress: string;
}
interface EstimateBridgeGasPriceParams {
  from: Chain;
  token: Token;
  to: Chain;
  destinationAddress: string;
}

interface GetWrappedTokenAddressParams {
  token: Token;
  from: Chain;
  to: Chain;
}

interface BridgeParams {
  from: Chain;
  token: Token;
  amount: BigNumber;
  to: Chain;
  destinationAddress: string;
}

interface ClaimParams {
  token: Token;
  amount: BigNumber;
  destinationNetwork: Chain;
  destinationAddress: string;
  index: number;
  smtProof: string[];
  globalExitRootNum: number;
  l2GlobalExitRootNum: number;
  mainnetExitRoot: string;
  rollupExitRoot: string;
}

interface BridgeContext {
  getBalance: (params: GetBalanceParams) => Promise<BigNumber>;
  getWrappedTokenAddress: (params: GetWrappedTokenAddressParams) => Promise<string>;
  estimateBridgeGasPrice: (params: EstimateBridgeGasPriceParams) => Promise<BigNumber>;
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  estimateBridgeGasPrice: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getBalance: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getWrappedTokenAddress: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC = (props) => {
  const { connectedProvider, account, changeNetwork } = useProvidersContext();

  const estimateGasPrice = useCallback(
    ({ chain, gasLimit }: { chain: Chain; gasLimit: BigNumber }): Promise<BigNumber> => {
      return chain.provider.getFeeData().then((feeData) => {
        const fee = calculateFee(gasLimit, feeData);
        if (fee === undefined) {
          return Promise.reject(new Error("Fee data is not available"));
        } else {
          return Promise.resolve(fee);
        }
      });
    },
    []
  );

  const estimateBridgeGasPrice = useCallback(
    ({ from, token, to, destinationAddress }: EstimateBridgeGasPriceParams) => {
      const amount = parseUnits("0", token.decimals);
      const contract = Bridge__factory.connect(from.contractAddress, from.provider);
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
    [estimateGasPrice]
  );

  const bridge = useCallback(
    async ({
      from,
      token,
      amount,
      to,
      destinationAddress,
    }: BridgeParams): Promise<ContractTransaction> => {
      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract = Bridge__factory.connect(
        from.contractAddress,
        connectedProvider.provider.getSigner()
      );
      const overrides: PayableOverrides =
        token.address === ethersConstants.AddressZero ? { value: amount } : {};

      const executeBridge = async () => {
        const doesTokenMatchNetwork = token.network === from.networkId;
        const isTokenEther = token.address === ethersConstants.AddressZero;
        const tokenAddress =
          doesTokenMatchNetwork || isTokenEther
            ? token.address
            : await getWrappedTokenAddress({
                token,
                from,
                to,
              });

        if (!isTokenEther) {
          if (account.status !== "successful") {
            throw new Error("The account address is not available");
          }

          const erc20Contract = Erc20__factory.connect(
            tokenAddress,
            connectedProvider.provider.getSigner()
          );
          const allowance = await erc20Contract.allowance(account.data, from.contractAddress);
          if (allowance.lt(amount)) {
            await erc20Contract.approve(from.contractAddress, amount);
          }
        }
        return contract.bridge(tokenAddress, amount, to.networkId, destinationAddress, overrides);
      };

      if (from.chainId === connectedProvider?.chainId) {
        return executeBridge();
      } else {
        return changeNetwork(from)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeBridge);
      }
    },
    [connectedProvider, account, changeNetwork]
  );

  const claim = useCallback(
    ({
      token,
      amount,
      destinationNetwork,
      destinationAddress,
      index,
      smtProof,
      globalExitRootNum,
      l2GlobalExitRootNum,
      mainnetExitRoot,
      rollupExitRoot,
    }: ClaimParams): Promise<ContractTransaction> => {
      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      const contract = Bridge__factory.connect(
        destinationNetwork.contractAddress,
        connectedProvider.provider.getSigner()
      );

      const isL2Claim = destinationNetwork.key === "polygon-hermez";

      const executeClaim = () =>
        contract.claim(
          token.address,
          amount,
          token.network,
          destinationNetwork.networkId,
          destinationAddress,
          smtProof,
          index,
          isL2Claim ? l2GlobalExitRootNum : globalExitRootNum,
          mainnetExitRoot,
          rollupExitRoot,
          isL2Claim ? { gasPrice: 0 } : {}
        );

      if (destinationNetwork.chainId === connectedProvider?.chainId) {
        return executeClaim();
      } else {
        return changeNetwork(destinationNetwork)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeClaim);
      }
    },
    [changeNetwork, connectedProvider]
  );

  const getBalance = async ({ token, from, to, ethereumAddress }: GetBalanceParams) => {
    const isTokenEther = token.address === ethersConstants.AddressZero;
    if (isTokenEther) {
      return Promise.reject(new Error("Ether is not supported as ERC20 token"));
    }
    const doesTokenMatchNetwork = token.network === from.networkId;

    const tokenAddress = doesTokenMatchNetwork
      ? token.address
      : await getWrappedTokenAddress({
          token,
          from,
          to,
        });

    const erc20Contract = Erc20__factory.connect(tokenAddress, from.provider);
    const balance = await erc20Contract.balanceOf(ethereumAddress);
    return balance;
  };

  const getWrappedTokenAddress = async ({
    token,
    from,
    to,
  }: GetWrappedTokenAddressParams): Promise<string> => {
    const bridgeContract = Bridge__factory.connect(from.contractAddress, from.provider);
    const tokenImplementationAddress = await bridgeContract.tokenImplementation();
    const salt = ethers.utils.solidityKeccak256(
      ["uint32", "address"],
      [to.networkId, token.address]
    );
    // Bytecode proxy from this blog https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
    const minimalBytecodeProxy = `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${tokenImplementationAddress.slice(
      2
    )}5af43d82803e903d91602b57fd5bf3`;
    const hashInitCode = ethers.utils.keccak256(minimalBytecodeProxy);

    return ethers.utils.getCreate2Address(bridgeContract.address, salt, hashInitCode);
  };

  return (
    <bridgeContext.Provider
      value={{
        estimateBridgeGasPrice,
        bridge,
        claim,
        getBalance,
        getWrappedTokenAddress,
      }}
      {...props}
    />
  );
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
