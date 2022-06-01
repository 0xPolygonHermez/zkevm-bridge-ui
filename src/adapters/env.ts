import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, getUsdcToken } from "src/constants";

interface Env {
  REACT_APP_ETHEREUM_RPC_URL: string;
  REACT_APP_ETHEREUM_EXPLORER_URL: string;
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_ETHEREUM_USDC_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_RPC_URL: string;
  REACT_APP_POLYGON_EXPLORER_URL: string;
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID: string;
  REACT_APP_BRIDGE_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_VERSION: string;
}

const envToDomain = ({
  REACT_APP_ETHEREUM_RPC_URL,
  REACT_APP_ETHEREUM_EXPLORER_URL,
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_ETHEREUM_USDC_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_RPC_URL,
  REACT_APP_POLYGON_EXPLORER_URL,
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID,
  REACT_APP_BRIDGE_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
  REACT_APP_VERSION,
}: Env): Promise<domain.Env> => {
  const polygonHermezNetworkId = z
    .number()
    .positive()
    .parse(Number(REACT_APP_POLYGON_HERMEZ_NETWORK_ID));

  return getChains({
    ethereum: {
      rpcUrl: REACT_APP_ETHEREUM_RPC_URL,
      explorerUrl: REACT_APP_ETHEREUM_EXPLORER_URL,
      contractAddress: REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
    },
    polygonHermez: {
      networkId: polygonHermezNetworkId,
      rpcUrl: REACT_APP_POLYGON_HERMEZ_RPC_URL,
      explorerUrl: REACT_APP_POLYGON_EXPLORER_URL,
      contractAddress: REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS,
    },
  }).then((chains) => {
    const ethereumChain = chains.find((chain) => chain.key === "ethereum");
    if (!ethereumChain) {
      throw new Error("Ethereum chain not found");
    }
    return {
      bridgeApiUrl: REACT_APP_BRIDGE_API_URL,
      fiatExchangeRates: {
        apiUrl: REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
        apiKey: REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
        usdcToken: getUsdcToken({
          address: REACT_APP_ETHEREUM_USDC_ADDRESS,
          chainId: ethereumChain.chainId,
        }),
      },
      chains,
      version: REACT_APP_VERSION,
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      REACT_APP_ETHEREUM_RPC_URL: z.string().url(),
      REACT_APP_ETHEREUM_EXPLORER_URL: z.string().url(),
      REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      REACT_APP_ETHEREUM_USDC_ADDRESS: z.string().length(42),
      REACT_APP_POLYGON_HERMEZ_RPC_URL: z.string().url(),
      REACT_APP_POLYGON_EXPLORER_URL: z.string().url(),
      REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      REACT_APP_POLYGON_HERMEZ_NETWORK_ID: z.string(),
      REACT_APP_BRIDGE_API_URL: z.string().url(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_URL: z.string().url(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
      REACT_APP_VERSION: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(process.env);

  return parsedEnv;
};

export { loadEnv };
