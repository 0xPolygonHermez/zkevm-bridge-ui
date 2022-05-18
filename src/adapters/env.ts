import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, ETH_TOKEN, getUsdtToken } from "src/constants";
import { erc20Tokens } from "src/erc20-tokens";

interface Env {
  REACT_APP_ETHEREUM_RPC_URL: string;
  REACT_APP_ETHEREUM_EXPLORER_URL: string;
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_RPC_URL: string;
  REACT_APP_POLYGON_EXPLORER_URL: string;
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID: string;
  REACT_APP_BRIDGE_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_USDT_ADDRESS: string;
  REACT_APP_USDT_NETWORK: string;
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: string;
  REACT_APP_VERSION: string;
  REACT_APP_ENVIRONMENT: "LOCAL" | "INTERNAL_TESTNET" | "TESTNET" | "MAINNET";
}

const envToDomain = ({
  REACT_APP_ETHEREUM_RPC_URL,
  REACT_APP_ETHEREUM_EXPLORER_URL,
  REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_RPC_URL,
  REACT_APP_POLYGON_EXPLORER_URL,
  REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_HERMEZ_NETWORK_ID,
  REACT_APP_BRIDGE_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
  REACT_APP_USDT_ADDRESS,
  REACT_APP_USDT_NETWORK,
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
  REACT_APP_VERSION,
  REACT_APP_ENVIRONMENT,
}: Env): Promise<domain.Env> => {
  const polygonHermezNetworkId = z
    .number()
    .positive()
    .parse(Number(REACT_APP_POLYGON_HERMEZ_NETWORK_ID));

  const usdtNetwork = z.number().nonnegative().parse(Number(REACT_APP_USDT_NETWORK));

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
  }).then((chains) => ({
    bridgeApiUrl: REACT_APP_BRIDGE_API_URL,
    tokenQuotes: {
      uniswapQuoterContractAddress: REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
    },
    fiatExchangeRates: {
      apiUrl: REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
      apiKey: REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
      usdtToken: getUsdtToken({ address: REACT_APP_USDT_ADDRESS, network: usdtNetwork }),
    },
    chains,
    tokens: [ETH_TOKEN, ...erc20Tokens[REACT_APP_ENVIRONMENT]],
    version: REACT_APP_VERSION,
  }));
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      REACT_APP_ETHEREUM_RPC_URL: z.string(),
      REACT_APP_ETHEREUM_EXPLORER_URL: z.string(),
      REACT_APP_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_POLYGON_HERMEZ_RPC_URL: z.string(),
      REACT_APP_POLYGON_EXPLORER_URL: z.string(),
      REACT_APP_POLYGON_HERMEZ_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_POLYGON_HERMEZ_NETWORK_ID: z.string(),
      REACT_APP_BRIDGE_API_URL: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_URL: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
      REACT_APP_USDT_ADDRESS: z.string(),
      REACT_APP_USDT_NETWORK: z.string(),
      REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: z.string(),
      REACT_APP_VERSION: z.string(),
      REACT_APP_ENVIRONMENT: z.union([
        z.literal("LOCAL"),
        z.literal("INTERNAL_TESTNET"),
        z.literal("TESTNET"),
        z.literal("MAINNET"),
      ]),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(process.env);

  return parsedEnv;
};

export { loadEnv };
