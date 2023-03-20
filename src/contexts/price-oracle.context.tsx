import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";
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
import {
  FIAT_DISPLAY_PRECISION,
  UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS,
  UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS,
  UNISWAP_V2_ROUTER_02_INIT_CODE_HASH,
} from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { Chain, FiatExchangeRates, Token } from "src/domain";
import { UniswapV2Pair__factory } from "src/types/contracts/uniswap-v2-pair";
import {
  UniswapV2Router02,
  UniswapV2Router02__factory,
} from "src/types/contracts/uniswap-v2-router-02";
import { multiplyAmounts } from "src/utils/amounts";
import { isTokenEther } from "src/utils/tokens";

const computePairAddress = ({ tokenA, tokenB }: { tokenA: Token; tokenB: Token }): string => {
  const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA];
  const salt = keccak256(
    ["bytes"],
    [pack(["address", "address"], [token0.address, token1.address])]
  );
  return getCreate2Address(
    UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS,
    salt,
    UNISWAP_V2_ROUTER_02_INIT_CODE_HASH
  );
};

interface GetTokenPriceParams {
  chain: Chain;
  token: Token;
}

interface PriceOracleContext {
  getTokenPrice: (params: GetTokenPriceParams) => Promise<BigNumber>;
}

const priceOracleContextNotReadyErrorMsg = "The price oracle context is not yet ready";

const priceOracleContext = createContext<PriceOracleContext>({
  getTokenPrice: () => {
    return Promise.reject(new Error(priceOracleContextNotReadyErrorMsg));
  },
});

const PriceOracleProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { tokens } = useTokensContext();
  const [fiatExchangeRates, setFiatExchangeRates] = useState<FiatExchangeRates>();
  const [uniswapV2Router02Contract, setUniswapV2Router02Contract] = useState<UniswapV2Router02>();

  const getTokenPrice = useCallback(
    async ({ token }: GetTokenPriceParams): Promise<BigNumber> => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (!env.fiatExchangeRates.areEnabled) {
        throw new Error("Fiat Exchange Rates feature is not enabled");
      }

      if (uniswapV2Router02Contract === undefined) {
        throw new Error("Uniswap V2 Router02 contract is not available");
      }

      if (fiatExchangeRates === undefined) {
        throw new Error("Fiat exchange rates are not available");
      }

      const erc20Token = isTokenEther(token) ? tokens?.find((t) => t.symbol === "WETH") : token;

      if (!erc20Token) {
        throw new Error(
          `ETH is not a valid ERC-20 token and its wrapped version "WETH" could not be found on the Ethereum chain`
        );
      }

      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");

      if (ethereumChain === undefined) {
        throw new Error("Ethereum chain is not available");
      }

      const uniswapPairContractAddress = computePairAddress({
        tokenA: erc20Token,
        tokenB: env.fiatExchangeRates.usdcToken,
      });

      const uniswapPairContract = UniswapV2Pair__factory.connect(
        uniswapPairContractAddress,
        ethereumChain.provider
      );

      const [reserveIn, reserveOut] = await uniswapPairContract.callStatic.getReserves();

      const rate = await uniswapV2Router02Contract.callStatic.getAmountOut(
        parseUnits("1", erc20Token.decimals),
        reserveIn,
        reserveOut
      );

      const fiatExchangeRate = fiatExchangeRates[getCurrency()];

      if (fiatExchangeRate === undefined) {
        throw new Error("Fiat exchange rate not found");
      }

      const price = multiplyAmounts(
        { precision: env.fiatExchangeRates.usdcToken.decimals, value: rate },
        {
          precision: FIAT_DISPLAY_PRECISION,
          value: parseUnits(fiatExchangeRate.toString(), FIAT_DISPLAY_PRECISION),
        },
        FIAT_DISPLAY_PRECISION
      );

      return price;
    },
    [env, fiatExchangeRates, tokens, uniswapV2Router02Contract]
  );

  useEffect(() => {
    if (env) {
      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");
      if (ethereumChain) {
        setUniswapV2Router02Contract(
          UniswapV2Router02__factory.connect(
            UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS,
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

  const value = useMemo(() => ({ getTokenPrice }), [getTokenPrice]);

  return <priceOracleContext.Provider value={value} {...props} />;
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
