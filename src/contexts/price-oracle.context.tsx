import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { pack, keccak256 } from "@ethersproject/solidity";
import { getCreate2Address } from "@ethersproject/address";

import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { formatTokenAmount } from "src/utils/amounts";
import {
  UniswapV2Router02,
  UniswapV2Router02__factory,
} from "src/types/contracts/uniswap-v2-router-02";
import { UniswapV2Pair__factory } from "src/types/contracts/uniswap-v2-pair";
import { FiatExchangeRates } from "src/domain";
import { getFiatExchangeRates } from "src/adapters/fiat-exchange-rates-api";
import { getCurrency } from "src/adapters/storage";
import { Token, Chain } from "src/domain";
import { getChainTokens } from "src/constants";

const INIT_CODE_HASH = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
const FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const computePairAddress = ({ tokenA, tokenB }: { tokenA: Token; tokenB: Token }): string => {
  const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA];
  const salt = keccak256(
    ["bytes"],
    [pack(["address", "address"], [token0.address, token1.address])]
  );
  return getCreate2Address(FACTORY_ADDRESS, salt, INIT_CODE_HASH);
};

interface GetTokenPriceParams {
  token: Token;
  chain: Chain;
}

interface PriceOracleContext {
  getTokenPrice: (params: GetTokenPriceParams) => Promise<number>;
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
    async ({ token, chain }: GetTokenPriceParams): Promise<number> => {
      const erc20Token =
        token.address === ethers.constants.AddressZero
          ? getChainTokens(chain).find((t) => t.symbol === "WETH")
          : token;

      if (!erc20Token) {
        throw new Error(
          `${token.symbol} is not a valid ERC-20 token and no wrapped ERC-20 token could be found`
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
        tokenB: env.fiatExchangeRates.usdtToken,
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
      const usdPrice = Number(formatTokenAmount(rate, env.fiatExchangeRates.usdtToken));
      const fiatExchangeRate = fiatExchangeRates[getCurrency()];

      if (!fiatExchangeRate) {
        throw new Error("Fiat exchange rate not found");
      }

      return usdPrice * fiatExchangeRate;
    },
    [env, fiatExchangeRates, uniswapV2Router02Contract]
  );

  useEffect(() => {
    if (env) {
      const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");
      if (ethereumChain) {
        setUniswapV2Router02Contract(
          UniswapV2Router02__factory.connect(
            env.tokenQuotes.uniswapV2Router02ContractAddress,
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
