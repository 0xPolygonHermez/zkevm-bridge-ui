import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";

import { loadEnv } from "src/adapters/env";
import {
  BRIDGE_CONFIGS,
  CHAINS,
  ETH_TOKENS,
  L1_PROVIDERS,
  L2_PROVIDERS,
  UNISWAP_QUOTER_ADDRESSES,
  USDT_TOKENS,
} from "src/constants";
import { Env } from "src/domain";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC = (props) => {
  const [env, setEnv] = useState<Env>();

  useEffect(() => {
    const env = loadEnv();

    setEnv({
      fiatExchangeRatesApiKey: env.REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
      infuraApiKey: env.REACT_APP_INFURA_API_KEY,
      chains: CHAINS[env.REACT_APP_NETWORK],
      bridgeConfig: BRIDGE_CONFIGS[env.REACT_APP_NETWORK],
      l1ProviderUrl: L1_PROVIDERS[env.REACT_APP_NETWORK],
      l2ProviderUrl: L2_PROVIDERS[env.REACT_APP_NETWORK],
      uniswapQuoterAddress: UNISWAP_QUOTER_ADDRESSES[env.REACT_APP_NETWORK],
      ethToken: ETH_TOKENS[env.REACT_APP_NETWORK],
      usdtToken: USDT_TOKENS[env.REACT_APP_NETWORK],
    });
  }, []);

  const value = useMemo(() => {
    return env;
  }, [env]);

  return <envContext.Provider value={value} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
