import {
  BigNumber,
  ContractTransaction,
  constants as ethersConstants,
  PayableOverrides,
  ethers,
} from "ethers";
import { parseUnits } from "ethers/lib/utils";
import axios from "axios";
import { createContext, FC, useContext, useCallback } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { Bridge__factory } from "src/types/contracts/bridge";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { BRIDGE_CALL_GAS_INCREASE_PERCENTAGE, getEtherToken } from "src/constants";
import { calculateFee } from "src/utils/fees";
import { formatTokenAmount } from "src/utils/amounts";
import tokenIconDefaultUrl from "src/assets/icons/tokens/erc20-icon.svg";
import { getDeposits, getClaims, getClaimStatus, getMerkleProof } from "src/adapters/bridge-api";
import { getCustomTokens } from "src/adapters/storage";
import { Env, Chain, Token, Bridge, Deposit, MerkleProof } from "src/domain";
import { erc20Tokens } from "src/assets/erc20-tokens";

interface GetTokenFromAddressParams {
  address: string;
  chain: Chain;
}

interface GetErc20TokenBalanceParams {
  chain: Chain;
  tokenAddress: string;
  accountAddress: string;
}

interface EstimateBridgeGasPriceParams {
  from: Chain;
  token: Token;
  to: Chain;
  destinationAddress: string;
}

interface GetBridgesParams {
  env: Env;
  ethereumAddress: string;
}

interface ComputeWrappedTokenAddressParams {
  token: Token;
  nativeTokenChain: Chain;
  wrappedTokenChain: Chain;
}

interface GetNativeTokenInfoParams {
  wrappedToken: Token;
  tokenChain: Chain;
}

interface BridgeParams {
  from: Chain;
  token: Token;
  amount: BigNumber;
  to: Chain;
  destinationAddress: string;
}

interface ClaimParams {
  deposit: Deposit;
  merkleProof: MerkleProof;
}

interface BridgeContext {
  getTokenFromAddress: (params: GetTokenFromAddressParams) => Promise<Token>;
  getErc20TokenBalance: (params: GetErc20TokenBalanceParams) => Promise<BigNumber>;
  computeWrappedTokenAddress: (params: ComputeWrappedTokenAddressParams) => Promise<string>;
  getNativeTokenInfo: (params: GetNativeTokenInfoParams) => Promise<{
    originalNetwork: number;
    originalTokenAddress: string;
  }>;
  estimateBridgeGasPrice: (params: EstimateBridgeGasPriceParams) => Promise<BigNumber>;
  getBridges: (params: GetBridgesParams) => Promise<Bridge[]>;
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  getTokenFromAddress: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getErc20TokenBalance: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  computeWrappedTokenAddress: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getNativeTokenInfo: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  estimateBridgeGasPrice: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getBridges: () => {
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
  const { connectedProvider, account, changeNetwork } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();

  const getTokenFromAddress = useCallback(
    async ({ address, chain }: GetTokenFromAddressParams): Promise<Token> => {
      const erc20Contract = Erc20__factory.connect(address, chain.provider);
      const name = await erc20Contract.name();
      const decimals = await erc20Contract.decimals();
      const symbol = await erc20Contract.symbol();
      const chainId = chain.chainId;
      const trustWalletLogoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
      const logoURI = await axios
        .head(trustWalletLogoUrl)
        .then(() => trustWalletLogoUrl)
        .catch(() => tokenIconDefaultUrl);
      const token: Token = {
        name,
        decimals,
        symbol,
        address,
        chainId,
        logoURI,
      };
      return token;
    },
    []
  );

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

  const getToken = useCallback(
    async ({
      env,
      tokenAddress,
      originNetwork,
      chain,
    }: {
      env: Env;
      tokenAddress: string;
      originNetwork: number;
      chain: Chain;
    }): Promise<Token> => {
      const token = [...getCustomTokens(), getEtherToken(chain), ...erc20Tokens].find(
        (token) => token.address === tokenAddress
      );
      if (token) {
        return token;
      } else {
        const chain = env.chains.find((chain) => chain.networkId === originNetwork);
        if (chain) {
          return await getTokenFromAddress({ address: tokenAddress, chain }).catch(() => {
            throw new Error(
              `The token with the address "${tokenAddress}" could not be found either in the list of supported Tokens or in the blockchain with network id "${originNetwork}"`
            );
          });
        } else {
          throw new Error(
            `The token with the address "${tokenAddress}" could not be found in the list of supported and the provided network id "${originNetwork}" is not supported`
          );
        }
      }
    },
    [getTokenFromAddress]
  );

  type Price = number | null;
  type TokenPrices = Partial<Record<string, Price>>;

  const getBridges = useCallback(
    async ({ env, ethereumAddress }: GetBridgesParams): Promise<Bridge[]> => {
      const apiUrl = env.bridgeApiUrl;
      const [apiDeposits, apiClaims] = await Promise.all([
        getDeposits({ apiUrl, ethereumAddress }),
        getClaims({ apiUrl, ethereumAddress }),
      ]);

      const deposits = await Promise.all(
        apiDeposits.map(async (apiDeposit): Promise<Deposit> => {
          const {
            network_id,
            dest_net,
            amount,
            dest_addr,
            deposit_cnt,
            tx_hash,
            token_addr,
            orig_net,
          } = apiDeposit;

          const from = env.chains.find((chain) => chain.networkId === network_id);
          if (from === undefined) {
            throw new Error(
              `The specified network_id "${network_id}" can not be found in the list of supported Chains`
            );
          }

          const to = env.chains.find((chain) => chain.networkId === dest_net);
          if (to === undefined) {
            throw new Error(
              `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
            );
          }

          const token = await getToken({
            env,
            tokenAddress: token_addr,
            originNetwork: orig_net,
            chain: from,
          });

          return {
            token,
            amount: BigNumber.from(amount),
            fiatAmount: undefined,
            destinationAddress: dest_addr,
            depositCount: deposit_cnt,
            txHash: tx_hash,
            from,
            to,
            tokenOriginNetwork: orig_net,
          };
        })
      );

      const tokenPrices: TokenPrices = await deposits.reduce(
        async (accTokenPrices: Promise<TokenPrices>, deposit: Deposit): Promise<TokenPrices> => {
          const tokenPrices = await accTokenPrices;
          const tokenCachedPrice = tokenPrices[deposit.token.address];
          const tokenPrice =
            tokenCachedPrice !== undefined
              ? tokenCachedPrice
              : await getTokenPrice({ token: deposit.token, chain: deposit.from }).catch(
                  () => null
                );

          return {
            ...tokenPrices,
            [deposit.token.address]: tokenPrice,
          };
        },
        Promise.resolve({})
      );

      return Promise.all(
        deposits.map(async (partialDeposit): Promise<Bridge> => {
          const tokenPrice = tokenPrices[partialDeposit.token.address];

          const fiatAmount =
            tokenPrice !== undefined && tokenPrice !== null
              ? tokenPrice * Number(formatTokenAmount(partialDeposit.amount, partialDeposit.token))
              : undefined;

          const deposit: Deposit = {
            ...partialDeposit,
            fiatAmount,
          };

          const apiClaim = apiClaims.find(
            (claim) =>
              claim.index === deposit.depositCount && claim.network_id === deposit.to.networkId
          );

          const id = `${deposit.depositCount}-${deposit.to.networkId}`;

          if (apiClaim) {
            return {
              status: "completed",
              id,
              deposit,
              claim: {
                txHash: apiClaim.tx_hash,
              },
            };
          }

          const claimStatus = await getClaimStatus({
            apiUrl,
            networkId: deposit.from.networkId,
            depositCount: deposit.depositCount,
          });

          if (claimStatus === false) {
            return {
              status: "initiated",
              id,
              deposit,
            };
          }

          const merkleProof = await getMerkleProof({
            apiUrl,
            networkId: deposit.from.networkId,
            depositCount: deposit.depositCount,
          });

          return {
            status: "on-hold",
            id,
            deposit,
            merkleProof,
          };
        })
      );
    },
    [getTokenPrice, getToken]
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
        const isTokenEther = token.address === ethersConstants.AddressZero;

        if (!isTokenEther) {
          if (account.status !== "successful") {
            throw new Error("The account address is not available");
          }

          const erc20Contract = Erc20__factory.connect(
            token.address,
            connectedProvider.provider.getSigner()
          );
          const allowance = await erc20Contract.allowance(account.data, from.contractAddress);
          if (allowance.lt(amount)) {
            await erc20Contract.approve(from.contractAddress, amount);
          }
        }
        return contract.bridge(token.address, amount, to.networkId, destinationAddress, overrides);
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
      deposit: { token, amount, tokenOriginNetwork, to, destinationAddress, depositCount: index },
      merkleProof: { merkleProof, exitRootNumber, l2ExitRootNumber, mainExitRoot, rollupExitRoot },
    }: ClaimParams): Promise<ContractTransaction> => {
      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      const contract = Bridge__factory.connect(
        to.contractAddress,
        connectedProvider.provider.getSigner()
      );

      const isL2Claim = to.key === "polygon-hermez";

      const executeClaim = () =>
        contract.claim(
          token.address,
          amount,
          tokenOriginNetwork,
          to.networkId,
          destinationAddress,
          merkleProof,
          index,
          isL2Claim ? l2ExitRootNumber : exitRootNumber,
          mainExitRoot,
          rollupExitRoot,
          isL2Claim ? { gasPrice: 0 } : {}
        );

      if (to.chainId === connectedProvider?.chainId) {
        return executeClaim();
      } else {
        return changeNetwork(to)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeClaim);
      }
    },
    [changeNetwork, connectedProvider, env]
  );

  const getErc20TokenBalance = async ({
    chain,
    tokenAddress,
    accountAddress,
  }: GetErc20TokenBalanceParams) => {
    const isTokenEther = tokenAddress === ethersConstants.AddressZero;
    if (isTokenEther) {
      return Promise.reject(new Error("Ether is not supported as ERC20 token"));
    }
    const erc20Contract = Erc20__factory.connect(tokenAddress, chain.provider);
    return await erc20Contract.balanceOf(accountAddress);
  };

  const computeWrappedTokenAddress = async ({
    token,
    nativeTokenChain,
    wrappedTokenChain,
  }: ComputeWrappedTokenAddressParams): Promise<string> => {
    const bridgeContract = Bridge__factory.connect(
      wrappedTokenChain.contractAddress,
      wrappedTokenChain.provider
    );
    const tokenImplementationAddress = await bridgeContract.tokenImplementation();
    const salt = ethers.utils.solidityKeccak256(
      ["uint32", "address"],
      [nativeTokenChain.networkId, token.address]
    );
    // Bytecode proxy from this blog https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
    const minimalBytecodeProxy = `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${tokenImplementationAddress.slice(
      2
    )}5af43d82803e903d91602b57fd5bf3`;
    const hashInitCode = ethers.utils.keccak256(minimalBytecodeProxy);

    return ethers.utils.getCreate2Address(bridgeContract.address, salt, hashInitCode);
  };

  const getNativeTokenInfo = ({
    wrappedToken,
    tokenChain,
  }: GetNativeTokenInfoParams): Promise<{
    originalNetwork: number;
    originalTokenAddress: string;
  }> => {
    const bridgeContract = Bridge__factory.connect(tokenChain.contractAddress, tokenChain.provider);
    return bridgeContract.addressToTokenInfo(wrappedToken.address).then((tokenInfo) => {
      if (tokenInfo.originalTokenAddress === ethers.constants.AddressZero) {
        throw new Error(`Can not find a native token for ${wrappedToken.name}`);
      }
      return tokenInfo;
    });
  };

  return (
    <bridgeContext.Provider
      value={{
        getTokenFromAddress,
        getErc20TokenBalance,
        computeWrappedTokenAddress,
        getNativeTokenInfo,
        estimateBridgeGasPrice,
        getBridges,
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
