import { BigNumber } from "ethers";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { PriceOracle, PriceOracle__factory } from "src/types/contracts/price-oracle";

interface PriceOracleContext {
  getTokenPrice: (tokenAddress: string) => Promise<BigNumber>;
}

const priceOracleContextNotReadyErrorMsg = "The price oracle context is not yet ready";

const priceOracleContext = createContext<PriceOracleContext>({
  getTokenPrice: () => {
    console.error(priceOracleContextNotReadyErrorMsg);
    return Promise.resolve(BigNumber.from(0));
  },
});

const PriceOracleProvider: FC = (props) => {
  const env = useEnvContext();
  const { l1Provider } = useProvidersContext();
  const [priceOracleContract, setPriceOracleContract] = useState<PriceOracle>();

  const getTokenPrice = async (tokenAddress: string): Promise<BigNumber> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (priceOracleContract === undefined) {
      throw new Error("Price oracle contract is not available");
    }

    return priceOracleContract.getRate(tokenAddress, env.REACT_APP_USDT_CONTRACT_ADDRESS, true);
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

  return <priceOracleContext.Provider value={{ getTokenPrice }} {...props} />;
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
