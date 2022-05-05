import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, ETH_TOKEN, getUsdtToken } from "src/constants";

interface Env {
  REACT_APP_ETHEREUM_RPC_URL: string;
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_RPC_URL: string;
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID: string;
  REACT_APP_BRIDGE_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_USDT_ADDRESS: string;
  REACT_APP_USDT_NETWORK: string;
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: string;
}

const envToDomain = ({
  REACT_APP_ETHEREUM_RPC_URL,
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_RPC_URL,
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID,
  REACT_APP_BRIDGE_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
  REACT_APP_USDT_ADDRESS,
  REACT_APP_USDT_NETWORK,
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
}: Env): domain.Env => {
  const polygonHermezNetworkId = z
    .number()
    .positive()
    .parse(Number(REACT_APP_POLYGON_HERMEZ_NETWORK_ID));

  const usdtNetwork = z.number().nonnegative().parse(Number(REACT_APP_USDT_NETWORK));

  return {
    bridgeApiUrl: REACT_APP_BRIDGE_API_URL,
    tokenQuotes: {
      uniswapQuoterContractAddress: REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
    },
    fiatExchangeRates: {
      apiUrl: REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
      apiKey: REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
    },
    chains: getChains({
      ethereum: {
        rpcUrl: REACT_APP_ETHEREUM_RPC_URL,
        contractAddress: REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
      },
      polygonHermez: {
        networkId: polygonHermezNetworkId,
        rpcUrl: REACT_APP_POLYGON_HERMEZ_RPC_URL,
        contractAddress: REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS,
      },
    }),
    tokens: {
      ETH: ETH_TOKEN,
      USDT: getUsdtToken({
        address: REACT_APP_USDT_ADDRESS,
        network: usdtNetwork,
      }),
    },
  };
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      REACT_APP_ETHEREUM_RPC_URL: z.string(),
      REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_POLYGON_HERMEZ_RPC_URL: z.string(),
      REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_POLYGON_HERMEZ_NETWORK_ID: z.string(),
      REACT_APP_BRIDGE_API_URL: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_URL: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
      REACT_APP_USDT_ADDRESS: z.string(),
      REACT_APP_USDT_NETWORK: z.string(),
      REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): domain.Env => {
  const parsedEnv = envParser.parse(process.env);

  return parsedEnv;
};

export { loadEnv };
