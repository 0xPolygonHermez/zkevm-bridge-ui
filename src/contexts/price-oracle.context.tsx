import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFiatExchangeRates } from "src/adapters/fiat-exchange-rates-api";
import { getCurrency } from "src/adapters/storage";
import { FIAT_DISPLAY_PRECISION, UNISWAP_V3_QUOTER_CONTRACT_ADDRESS } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { FiatExchangeRates, Token, UniswapV3FeeAmount } from "src/domain";
import { UniswapV3Quoter, UniswapV3Quoter__factory } from "src/types/contracts/uniswap-v3-quoter";
import { multiplyAmounts } from "src/utils/amounts";
import { isTokenEther } from "src/utils/tokens";

interface GetTokenPriceParams {
  token: Token;
}

interface PriceOracleContext {
  getTokenPrice: (params: GetTokenPriceParams) => Promise<BigNumber>;
  getTokenPriceInUSDC: (params: GetTokenPriceParams) => Promise<BigNumber>;
}

const priceOracleContextNotReadyErrorMsg = "The price oracle context is not yet ready";

const priceOracleContext = createContext<PriceOracleContext>({
  getTokenPrice: () => {
    return Promise.reject(new Error(priceOracleContextNotReadyErrorMsg));
  },
  getTokenPriceInUSDC: () => {
    return Promise.reject(new Error(priceOracleContextNotReadyErrorMsg));
  },
});

const PriceOracleProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const [fiatExchangeRates, setFiatExchangeRates] = useState<FiatExchangeRates>();
  const [uniswapV3QuoterContract, setUniswapV3QuoterContract] = useState<UniswapV3Quoter>();

  const getTokenPriceInUSDC = useCallback(
    async ({ token }: GetTokenPriceParams) => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (token.address.toLowerCase() === env.usdcToken.address.toLowerCase()) {
        return parseUnits("1", env.usdcToken.decimals);
      }

      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");
      const erc20Token = isTokenEther(token) ? env.wethToken : token;

      if (ethereumChain === undefined) {
        throw new Error("Ethereum chain is not available");
      }

      if (uniswapV3QuoterContract === undefined) {
        throw new Error("Uniswap v3 Quoter contract not available");
      }

      if (!erc20Token) {
        throw new Error(
          `ETH is not a valid ERC-20 token and its wrapped version "WETH" could not be found on the Ethereum chain`
        );
      }

      return uniswapV3QuoterContract.callStatic.quoteExactInputSingle(
        erc20Token.address,
        env.usdcToken.address,
        UniswapV3FeeAmount.MEDIUM,
        parseUnits("1", erc20Token.decimals),
        0
      );
    },
    [env, uniswapV3QuoterContract]
  );

  const getTokenPrice = useCallback(
    async ({ token }: GetTokenPriceParams): Promise<BigNumber> => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (!env.fiatExchangeRates.areEnabled) {
        throw new Error("Fiat Exchange Rates feature is not enabled");
      }

      if (fiatExchangeRates === undefined) {
        throw new Error("Fiat exchange rates are not available");
      }

      const erc20Token = isTokenEther(token) ? env.wethToken : token;

      if (!erc20Token) {
        throw new Error(
          `ETH is not a valid ERC-20 token and its wrapped version "WETH" could not be found on the Ethereum chain`
        );
      }

      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");

      if (ethereumChain === undefined) {
        throw new Error("Ethereum chain is not available");
      }

      const rate = await getTokenPriceInUSDC({ token });
      const fiatExchangeRate = fiatExchangeRates[getCurrency()];

      if (fiatExchangeRate === undefined) {
        throw new Error("Fiat exchange rate not found");
      }

      const price = multiplyAmounts(
        { precision: env.usdcToken.decimals, value: rate },
        {
          precision: FIAT_DISPLAY_PRECISION,
          value: parseUnits(fiatExchangeRate.toString(), FIAT_DISPLAY_PRECISION),
        },
        FIAT_DISPLAY_PRECISION
      );

      return price;
    },
    [env, fiatExchangeRates, getTokenPriceInUSDC]
  );

  useEffect(() => {
    if (env) {
      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");

      if (ethereumChain) {
        setUniswapV3QuoterContract(
          UniswapV3Quoter__factory.connect(
            UNISWAP_V3_QUOTER_CONTRACT_ADDRESS,
            ethereumChain.provider
          )
        );
      }
    }
  }, [env]);

  useEffect(() => {
    if (env && env.fiatExchangeRates.areEnabled) {
      getFiatExchangeRates({
        apiKey: env.fiatExchangeRates.apiKey,
        apiUrl: env.fiatExchangeRates.apiUrl,
      })
        .then(setFiatExchangeRates)
        .catch(notifyError);
    }
  }, [env, notifyError]);

  const value = useMemo(
    () => ({ getTokenPrice, getTokenPriceInUSDC }),
    [getTokenPrice, getTokenPriceInUSDC]
  );

  return <priceOracleContext.Provider value={value} {...props} />;
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
