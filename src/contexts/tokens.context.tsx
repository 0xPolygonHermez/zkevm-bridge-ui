import { Web3Provider } from "@ethersproject/providers";
import axios from "axios";
import { BigNumber, constants as ethersConstants } from "ethers";
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as ethereum from "src/adapters/ethereum";
import { cleanupCustomTokens, getCustomTokens } from "src/adapters/storage";
import { getEthereumErc20Tokens } from "src/adapters/tokens";
import tokenIconDefaultUrl from "src/assets/icons/tokens/erc20-icon.svg";
import { getEtherToken } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Chain, Env, Token } from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { isTokenEther } from "src/utils/tokens";
import { isAsyncTaskDataAvailable } from "src/utils/types";

interface ComputeWrappedTokenAddressParams {
  nativeChain: Chain;
  otherChain: Chain;
  token: Token;
}

interface GetNativeTokenInfoParams {
  address: string;
  chain: Chain;
}

interface AddWrappedTokenParams {
  token: Token;
}

interface GetTokenFromAddressParams {
  address: string;
  chain: Chain;
}

interface GetTokenParams {
  env: Env;
  originNetwork: number;
  tokenOriginAddress: string;
}

interface GetErc20TokenBalanceParams {
  accountAddress: string;
  chain: Chain;
  tokenAddress: string;
}

interface ApproveParams {
  amount: BigNumber;
  from: Chain;
  owner: string;
  provider: Web3Provider;
  spender: string;
  token: Token;
}

interface TokensContext {
  addWrappedToken: (params: AddWrappedTokenParams) => Promise<Token>;
  approve: (params: ApproveParams) => Promise<void>;
  getErc20TokenBalance: (params: GetErc20TokenBalanceParams) => Promise<BigNumber>;
  getToken: (params: GetTokenParams) => Promise<Token>;
  getTokenFromAddress: (params: GetTokenFromAddressParams) => Promise<Token>;
  tokens?: Token[];
}

const tokensContextNotReadyMsg = "The tokens context is not yet ready";

const tokensContext = createContext<TokensContext>({
  addWrappedToken: () => Promise.reject(tokensContextNotReadyMsg),
  approve: () => Promise.reject(tokensContextNotReadyMsg),
  getErc20TokenBalance: () => Promise.reject(tokensContextNotReadyMsg),
  getToken: () => Promise.reject(tokensContextNotReadyMsg),
  getTokenFromAddress: () => Promise.reject(tokensContextNotReadyMsg),
});

const TokensProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { changeNetwork, connectedProvider } = useProvidersContext();
  const [tokens, setTokens] = useState<Token[]>();
  const fetchedTokens = useRef<Token[]>([]);

  /**
   * Provided a token, its native chain and any other chain, computes the address of the wrapped token on the other chain
   */
  const computeWrappedTokenAddress = useCallback(
    ({ nativeChain, otherChain, token }: ComputeWrappedTokenAddressParams): Promise<string> => {
      if (isTokenEther(token)) {
        throw Error("Can't precalculate the wrapper address of Ether");
      }
      const bridgeContract = Bridge__factory.connect(
        otherChain.bridgeContractAddress,
        otherChain.provider
      );

      return bridgeContract.precalculatedWrapperAddress(
        nativeChain.networkId,
        token.address,
        token.name,
        token.symbol,
        token.decimals
      );
    },
    []
  );

  /**
   * Provided a token and a chain, when the token is wrapped, returns the native token's networkId and address and throws otherwise
   */
  const getNativeTokenInfo = useCallback(
    ({
      address,
      chain,
    }: GetNativeTokenInfoParams): Promise<{
      originNetwork: number;
      originTokenAddress: string;
    }> => {
      const bridgeContract = Bridge__factory.connect(chain.bridgeContractAddress, chain.provider);

      return bridgeContract.wrappedTokenToTokenInfo(address).then((tokenInfo) => {
        if (tokenInfo.originTokenAddress === ethersConstants.AddressZero) {
          throw new Error(`Can not find a native token for the address "${address}"`);
        }
        return tokenInfo;
      });
    },
    []
  );

  /**
   * Provided a token, if its property wrappedToken is missing, adds it and returns the new token
   * Important: It's assumed that the token is native to the chain declared in token.chainId
   */
  const addWrappedToken = useCallback(
    ({ token }: AddWrappedTokenParams): Promise<Token> => {
      if (token.wrappedToken || isTokenEther(token)) {
        return Promise.resolve(token);
      } else {
        if (!env) {
          throw Error("The env is not available");
        }
        const ethereumChain = env.chains[0];
        const polygonZkEVMChain = env.chains[1];
        const nativeChain =
          token.chainId === ethereumChain.chainId ? ethereumChain : polygonZkEVMChain;
        const wrappedChain =
          nativeChain.chainId === ethereumChain.chainId ? polygonZkEVMChain : ethereumChain;

        return computeWrappedTokenAddress({
          nativeChain,
          otherChain: wrappedChain,
          token,
        })
          .then((wrappedAddress) => {
            const newToken: Token = {
              ...token,
              wrappedToken: {
                address: wrappedAddress,
                chainId: wrappedChain.chainId,
              },
            };
            return newToken;
          })
          .catch((e) => {
            notifyError(e);
            return Promise.resolve(token);
          });
      }
    },
    [env, computeWrappedTokenAddress, notifyError]
  );

  const getTokenFromAddress = useCallback(
    async ({ address, chain }: GetTokenFromAddressParams): Promise<Token> => {
      if (!env) {
        throw Error("The env is not ready");
      }

      const erc20Contract = Erc20__factory.connect(address, chain.provider);
      const name = await erc20Contract.name();
      const decimals = await erc20Contract.decimals();
      const symbol = await erc20Contract.symbol();
      const trustWalletLogoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
      const logoURI = await axios
        .head(trustWalletLogoUrl)
        .then(() => trustWalletLogoUrl)
        .catch(() => tokenIconDefaultUrl);

      return getNativeTokenInfo({ address, chain })
        .then(({ originNetwork, originTokenAddress }) => {
          // the provided address belongs to a wrapped token
          const originalTokenChain = env.chains.find((chain) => chain.networkId === originNetwork);
          if (!originalTokenChain) {
            throw Error(`Could not find a chain that matched the originNetwork ${originNetwork}`);
          }
          return {
            address: originTokenAddress,
            chainId: originalTokenChain.chainId,
            decimals,
            logoURI,
            name,
            symbol,
            wrappedToken: {
              address,
              chainId: chain.chainId,
            },
          };
        })
        .catch(() => {
          // the provided address belongs to a native token
          return addWrappedToken({
            token: {
              address,
              chainId: chain.chainId,
              decimals,
              logoURI,
              name,
              symbol,
            },
          });
        });
    },
    [addWrappedToken, env, getNativeTokenInfo]
  );

  const getToken = useCallback(
    async ({ env, originNetwork, tokenOriginAddress }: GetTokenParams): Promise<Token> => {
      const chain = env.chains.find((chain) => chain.networkId === originNetwork);
      if (!chain) {
        throw new Error(
          `The chain with the originNetwork "${originNetwork}" could not be found in the list of supported Chains`
        );
      }
      const token = [
        ...getCustomTokens(),
        ...(tokens || [getEtherToken(chain)]),
        ...fetchedTokens.current,
      ].find(
        (token) =>
          (token.address === tokenOriginAddress && token.chainId === chain.chainId) ||
          (token.wrappedToken &&
            token.wrappedToken.address === tokenOriginAddress &&
            token.wrappedToken.chainId === chain.chainId)
      );

      if (token) {
        return token;
      } else {
        return getTokenFromAddress({ address: tokenOriginAddress, chain })
          .then((token) => {
            fetchedTokens.current = [...fetchedTokens.current, token];
            return token;
          })
          .catch(() => {
            throw new Error(
              `The token with the address "${tokenOriginAddress}" could not be found either in the list of supported Tokens or in the blockchain "${chain.name}" with chain id "${chain.chainId}"`
            );
          });
      }
    },
    [tokens, getTokenFromAddress]
  );

  const getErc20TokenBalance = useCallback(
    async ({ accountAddress, chain, tokenAddress }: GetErc20TokenBalanceParams) => {
      const isTokenEther = tokenAddress === ethersConstants.AddressZero;
      if (isTokenEther) {
        return Promise.reject(new Error("Ether is not supported as ERC20 token"));
      }
      const erc20Contract = Erc20__factory.connect(tokenAddress, chain.provider);
      return await erc20Contract.balanceOf(accountAddress);
    },
    []
  );

  const approve = useCallback(
    ({ amount, from, owner, provider, spender, token }: ApproveParams) => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        throw new Error("Connected provider is not available");
      }

      const executeApprove = async () =>
        ethereum.approve({ amount, from, owner, provider, spender, token });

      if (from.chainId === connectedProvider.data.chainId) {
        return executeApprove();
      } else {
        return changeNetwork(from)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeApprove);
      }
    },
    [connectedProvider, changeNetwork]
  );

  // initialize tokens
  useEffect(() => {
    if (env) {
      const ethereumChain = env.chains[0];
      getEthereumErc20Tokens()
        .then((ethereumErc20Tokens) =>
          Promise.all(
            ethereumErc20Tokens
              .filter((token) => token.chainId === ethereumChain.chainId)
              .map((token) => addWrappedToken({ token }))
          )
            .then((chainTokens) => {
              const tokens = [getEtherToken(ethereumChain), ...chainTokens];
              cleanupCustomTokens(tokens);
              setTokens(tokens);
            })
            .catch(notifyError)
        )
        .catch(notifyError);
    }
  }, [env, addWrappedToken, notifyError]);

  const value = useMemo(() => {
    return {
      addWrappedToken,
      approve,
      getErc20TokenBalance,
      getToken,
      getTokenFromAddress,
      tokens,
    };
  }, [tokens, getTokenFromAddress, getToken, getErc20TokenBalance, addWrappedToken, approve]);

  return <tokensContext.Provider value={value} {...props} />;
};

const useTokensContext = (): TokensContext => {
  return useContext(tokensContext);
};

export { TokensProvider, useTokensContext };
