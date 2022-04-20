import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";

import { loadEnv } from "src/adapters/env";
import { getChains, getEthToken, getUsdtToken } from "src/constants";
import { Config } from "src/domain";

const configContext = createContext<Config | undefined>(undefined);

const ConfigProvider: FC = (props) => {
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    const env = loadEnv();

    setConfig({
      l1Node: {
        rpcUrl: env.l1RpcUrl,
        chainId: env.l1ChainId,
      },
      l2Node: {
        rpcUrl: env.l2RpcUrl,
        chainId: env.l2ChainId,
      },
      bridge: {
        apiUrl: env.bridgeApiUrl,
        l1ContractAddress: env.l1BridgeContractAddress,
        l2ContractAddress: env.l2BridgeContractAddress,
      },
      tokenQuotes: {
        uniswapQuoterContractAddress: env.uniswapQuoterContractAddress,
      },
      fiatExchangeRates: {
        apiUrl: env.fiatExchangeRatesApiUrl,
        apiKey: env.fiatExchangeRatesApiKey,
      },
      chains: getChains({
        ethereumChainId: env.l1ChainId,
        polygonHermezChainId: env.l2ChainId,
      }),
      tokens: {
        ETH: getEthToken({ chainId: env.l1ChainId }),
        USDT: getUsdtToken({
          address: env.usdtAddress,
          chainId: env.l1ChainId,
        }),
      },
    });
  }, []);

  const value = useMemo(() => {
    return config;
  }, [config]);

  return <configContext.Provider value={value} {...props} />;
};

const useConfigContext = (): Config | undefined => {
  return useContext(configContext);
};

export { ConfigProvider, useConfigContext };
