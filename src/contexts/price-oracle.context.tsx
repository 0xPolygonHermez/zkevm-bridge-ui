import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { pack, keccak256 } from "@ethersproject/solidity";
import { getCreate2Address } from "@ethersproject/address";

import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { multiplyAmounts } from "src/utils/amounts";
import { getChainName } from "src/utils/labels";
import {
  UniswapV2Router02,
  UniswapV2Router02__factory,
} from "src/types/contracts/uniswap-v2-router-02";
import { UniswapV2Pair__factory } from "src/types/contracts/uniswap-v2-pair";
import { FiatExchangeRates } from "src/domain";
import { getFiatExchangeRates } from "src/adapters/fiat-exchange-rates-api";
import { getCurrency } from "src/adapters/storage";
import { Token, Chain } from "src/domain";
import {
  getChainTokens,
  UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS,
  UNISWAP_V2_ROUTER_02_INIT_CODE_HASH,
  UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS,
  FIAT_DISPLAY_PRECISION,
} from "src/constants";

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
  token: Token;
  chain: Chain;
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

const PriceOracleProvider: FC = (props) => {
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const [fiatExchangeRates, setFiatExchangeRates] = useState<FiatExchangeRates>();
  const [uniswapV2Router02Contract, setUniswapV2Router02Contract] = useState<UniswapV2Router02>();

  const getTokenPrice = useCallback(
    async ({ token, chain }: GetTokenPriceParams): Promise<BigNumber> => {
      const erc20Token =
        token.address === ethers.constants.AddressZero
          ? getChainTokens(chain).find((t) => t.symbol === "WETH")
          : token;

      if (!erc20Token) {
        throw new Error(
          `ETH is not a valid ERC-20 token and its wrapped version "WETH" could not be found on the ${getChainName(
            chain
          )} chain`
        );
      }
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (uniswapV2Router02Contract === undefined) {
        throw new Error("Uniswap V2 Router02 contract is not available");
      }

      if (fiatExchangeRates === undefined) {
        throw new Error("Fiat exchange rates are not available");
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
        { value: rate, precision: env.fiatExchangeRates.usdcToken.decimals },
        {
          value: parseUnits(fiatExchangeRate.toString(), FIAT_DISPLAY_PRECISION),
          precision: FIAT_DISPLAY_PRECISION,
        },
        FIAT_DISPLAY_PRECISION
      );

      return price;
    },
    [env, fiatExchangeRates, uniswapV2Router02Contract]
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
    if (env) {
      getFiatExchangeRates({
        apiUrl: env.fiatExchangeRates.apiUrl,
        apiKey: env.fiatExchangeRates.apiKey,
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
