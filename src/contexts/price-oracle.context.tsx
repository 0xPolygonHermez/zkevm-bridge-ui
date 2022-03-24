import { formatUnits } from "ethers/lib/utils";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useGlobalContext } from "src/contexts/global.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Currency, FiatExchangeRates } from "src/domain";
import { PriceOracle, PriceOracle__factory } from "src/types/contracts/price-oracle";
import { getFiatExchangeRates } from "src/adapters/fiat-exchange-rates";
import { USDT_DECIMALS } from "src/constants";
import * as storage from "src/adapters/local-storage";

interface PriceOracleContext {
  preferredCurrency?: Currency;
  changePreferredCurrency: (currency: Currency) => void;
  getTokenPrice: (tokenAddress: string, preferredCurrency: Currency) => Promise<number>;
}

const priceOracleContextNotReadyErrorMsg = "The price oracle context is not yet ready";

const priceOracleContext = createContext<PriceOracleContext>({
  changePreferredCurrency: () => {
    console.error(priceOracleContextNotReadyErrorMsg);
  },
  getTokenPrice: () => {
    console.error(priceOracleContextNotReadyErrorMsg);
    return Promise.resolve(0);
  },
});

const PriceOracleProvider: FC = (props) => {
  const env = useEnvContext();
  const { l1Provider } = useProvidersContext();
  const { openSnackbar } = useGlobalContext();
  const [preferredCurrency, setPreferredCurrency] = useState(storage.getCurrency());
  const [fiatExchangeRates, setFiatExchangeRates] = useState<FiatExchangeRates>();
  const [priceOracleContract, setPriceOracleContract] = useState<PriceOracle>();

  const changePreferredCurrency = (currency: Currency): void => {
    storage.setCurrency(currency);
    setPreferredCurrency(currency);
  };

  const getTokenPrice = async (tokenAddress: string): Promise<number> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (priceOracleContract === undefined) {
      throw new Error("Price oracle contract is not available");
    }

    if (fiatExchangeRates === undefined) {
      throw new Error("Fiat exchange rates are not available");
    }

    const rate = await priceOracleContract.getRate(
      tokenAddress,
      env.REACT_APP_USDT_CONTRACT_ADDRESS,
      true
    );
    const usdPrice = Number(formatUnits(rate, USDT_DECIMALS));
    const fiatExchangeRate = fiatExchangeRates[preferredCurrency];

    return usdPrice * fiatExchangeRate;
  };

  useEffect(() => {
    if (env && l1Provider) {
      const oracleContract = PriceOracle__factory.connect(
        env.REACT_APP_PRICE_ORACLE_CONTRACT_ADDRESS,
        l1Provider
      );

      setPriceOracleContract(oracleContract);
    }
  }, [env, l1Provider]);

  useEffect(() => {
    if (env) {
      getFiatExchangeRates({ apiKey: env.REACT_APP_FIAT_EXCHANGE_RATES_API_KEY })
        .then(setFiatExchangeRates)
        .catch((error) => {
          console.error(error);
          // void parseError(error).then((parsedError) =>
          //   openSnackbar({ type: "error", parsed: parsedError })
          // );
        });
    }
  }, [env, openSnackbar]);

  return (
    <priceOracleContext.Provider
      value={{ preferredCurrency, changePreferredCurrency, getTokenPrice }}
      {...props}
    />
  );
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
