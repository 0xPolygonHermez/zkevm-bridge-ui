import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { UniswapQuoter, UniswapQuoter__factory } from "src/types/contracts/uniswap-quoter";
import { Currency, FiatExchangeRates } from "src/domain";
import { getFiatExchangeRates } from "src/adapters/fiat-exchange-rates-api";
import { PREFERRED_CURRENCY } from "src/constants";
import { UNISWAP_V3_POOL_FEE } from "src/constants";
import * as storage from "src/adapters/storage";
import { parseError } from "src/adapters/error";
import { useUIContext } from "src/contexts/ui.context";

interface PriceOracleContext {
  preferredCurrency?: Currency;
  getTokenPrice: (tokenAddress: string, preferredCurrency: Currency) => Promise<number>;
  changePreferredCurrency: (currency: Currency) => void;
}

const priceOracleContextNotReadyErrorMsg = "The price oracle context is not yet ready";

const priceOracleContext = createContext<PriceOracleContext>({
  preferredCurrency: PREFERRED_CURRENCY,
  changePreferredCurrency: () => {
    console.error(priceOracleContextNotReadyErrorMsg);
  },
  getTokenPrice: () => {
    return Promise.reject(new Error(priceOracleContextNotReadyErrorMsg));
  },
});

const PriceOracleProvider: FC = (props) => {
  const env = useEnvContext();
  const { l1Provider } = useProvidersContext();
  const { openSnackbar } = useUIContext();
  const [preferredCurrency, setPreferredCurrency] = useState(storage.getCurrency());
  const [fiatExchangeRates, setFiatExchangeRates] = useState<FiatExchangeRates>();
  const [quoterContract, setQuoterContract] = useState<UniswapQuoter>();

  const changePreferredCurrency = useCallback((currency: Currency): void => {
    storage.setCurrency(currency);
    setPreferredCurrency(currency);
  }, []);

  const getTokenPrice = useCallback(
    async (tokenAddress: string): Promise<number> => {
      if (env === undefined) {
        throw new Error("Environment is not available");
      }

      if (quoterContract === undefined) {
        throw new Error("Price oracle contract is not available");
      }

      if (fiatExchangeRates === undefined) {
        throw new Error("Fiat exchange rates are not available");
      }

      const rate = await quoterContract.callStatic.quoteExactInputSingle(
        tokenAddress,
        env.tokens.USDT.address,
        UNISWAP_V3_POOL_FEE,
        parseUnits("1"),
        0
      );
      const usdPrice = Number(formatUnits(rate, env.tokens.USDT.decimals));
      const fiatExchangeRate = fiatExchangeRates[preferredCurrency];

      if (!fiatExchangeRate) {
        throw new Error("Fiat exchange rate not found");
      }

      return usdPrice * fiatExchangeRate;
    },
    [env, fiatExchangeRates, quoterContract, preferredCurrency]
  );

  useEffect(() => {
    if (env && l1Provider) {
      const quoterContract = UniswapQuoter__factory.connect(
        env.tokenQuotes.uniswapQuoterContractAddress,
        l1Provider
      );

      setQuoterContract(quoterContract);
    }
  }, [env, l1Provider]);

  useEffect(() => {
    if (env) {
      getFiatExchangeRates({
        apiUrl: env.fiatExchangeRates.apiUrl,
        apiKey: env.fiatExchangeRates.apiKey,
      })
        .then(setFiatExchangeRates)
        .catch((error) => {
          void parseError(error).then((parsedError) =>
            openSnackbar({ type: "error", parsed: parsedError })
          );
        });
    }
  }, [env, openSnackbar]);

  const value = useMemo(
    () => ({ preferredCurrency, getTokenPrice, changePreferredCurrency }),
    [preferredCurrency, getTokenPrice, changePreferredCurrency]
  );

  return <priceOracleContext.Provider value={value} {...props} />;
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
