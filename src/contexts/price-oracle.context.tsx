import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { UNISWAP_V3_POOL_FEE } from "src/constants";
import { useProvidersContext } from "src/contexts/providers.context";
import { UniswapQuoter, UniswapQuoter__factory } from "src/types/contracts/uniswap-quoter";

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
  const [quoterContract, setQuoterContract] = useState<UniswapQuoter>();

  const getTokenPrice = (tokenAddress: string): Promise<BigNumber> => {
    if (env === undefined) {
      throw new Error("Environment is not available");
    }

    if (quoterContract === undefined) {
      throw new Error("Price oracle contract is not available");
    }

    return quoterContract.callStatic.quoteExactInputSingle(
      tokenAddress,
      env.REACT_APP_USDT_CONTRACT_ADDRESS,
      UNISWAP_V3_POOL_FEE,
      parseUnits("1"),
      0
    );
  };

  useEffect(() => {
    if (env && l1Provider) {
      const quoterContract = UniswapQuoter__factory.connect(
        env.REACT_APP_PRICE_ORACLE_CONTRACT_ADDRESS,
        l1Provider
      );

      setQuoterContract(quoterContract);
    }
  }, [env, l1Provider]);

  return <priceOracleContext.Provider value={{ getTokenPrice }} {...props} />;
};

const usePriceOracleContext = (): PriceOracleContext => {
  return useContext(priceOracleContext);
};

export { PriceOracleProvider, usePriceOracleContext };
