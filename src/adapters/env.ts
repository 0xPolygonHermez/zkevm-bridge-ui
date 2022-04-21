import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, getEthToken, getUsdtToken } from "src/constants";

interface Env {
  REACT_APP_L1_RPC_URL: string;
  REACT_APP_L1_CHAIN_ID: string;
  REACT_APP_L1_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_L2_RPC_URL: string;
  REACT_APP_L2_CHAIN_ID: string;
  REACT_APP_L2_BRIDGE_CONTRACT_ADDRESS: string;
  REACT_APP_BRIDGE_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_USDT_ADDRESS: string;
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: string;
}

const envToDomain = ({
  REACT_APP_L1_RPC_URL,
  REACT_APP_L1_CHAIN_ID,
  REACT_APP_L2_RPC_URL,
  REACT_APP_L2_CHAIN_ID,
  REACT_APP_BRIDGE_API_URL,
  REACT_APP_L1_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_L2_BRIDGE_CONTRACT_ADDRESS,
  REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
  REACT_APP_USDT_ADDRESS,
  REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
}: Env): domain.Env => {
  const l1ChainId = z.number().positive().parse(Number(REACT_APP_L1_CHAIN_ID));
  const l2ChainId = z.number().positive().parse(Number(REACT_APP_L2_CHAIN_ID));

  return {
    l1Node: {
      rpcUrl: REACT_APP_L1_RPC_URL,
      chainId: l1ChainId,
    },
    l2Node: {
      rpcUrl: REACT_APP_L2_RPC_URL,
      chainId: REACT_APP_L2_CHAIN_ID,
    },
    bridge: {
      apiUrl: REACT_APP_BRIDGE_API_URL,
      l1ContractAddress: REACT_APP_L1_BRIDGE_CONTRACT_ADDRESS,
      l2ContractAddress: REACT_APP_L2_BRIDGE_CONTRACT_ADDRESS,
    },
    tokenQuotes: {
      uniswapQuoterContractAddress: REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
    },
    fiatExchangeRates: {
      apiUrl: REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
      apiKey: REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
    },
    chains: getChains({
      ethereumChainId: l1ChainId,
      polygonHermezChainId: l2ChainId,
    }),
    tokens: {
      ETH: getEthToken({ chainId: l1ChainId }),
      USDT: getUsdtToken({
        address: REACT_APP_USDT_ADDRESS,
        chainId: l1ChainId,
      }),
    },
  };
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      REACT_APP_L1_RPC_URL: z.string(),
      REACT_APP_L1_CHAIN_ID: z.string(),
      REACT_APP_L2_RPC_URL: z.string(),
      REACT_APP_L2_CHAIN_ID: z.string(),
      REACT_APP_BRIDGE_API_URL: z.string(),
      REACT_APP_L1_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_L2_BRIDGE_CONTRACT_ADDRESS: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_URL: z.string(),
      REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
      REACT_APP_USDT_ADDRESS: z.string(),
      REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): domain.Env => {
  const parsedEnv = envParser.parse(process.env);

  return parsedEnv;
};

export { loadEnv };
