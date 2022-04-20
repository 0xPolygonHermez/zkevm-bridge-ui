import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

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

const envParser = StrictSchema<Env>()(
  z.object({
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
);

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
}: Env): domain.Env => ({
  l1RpcUrl: REACT_APP_L1_RPC_URL,
  l1ChainId: Number(REACT_APP_L1_CHAIN_ID),
  l2RpcUrl: REACT_APP_L2_RPC_URL,
  l2ChainId: Number(REACT_APP_L2_CHAIN_ID),
  bridgeApiUrl: REACT_APP_BRIDGE_API_URL,
  l1BridgeContractAddress: REACT_APP_L1_BRIDGE_CONTRACT_ADDRESS,
  l2BridgeContractAddress: REACT_APP_L2_BRIDGE_CONTRACT_ADDRESS,
  fiatExchangeRatesApiUrl: REACT_APP_FIAT_EXCHANGE_RATES_API_URL,
  fiatExchangeRatesApiKey: REACT_APP_FIAT_EXCHANGE_RATES_API_KEY,
  usdtAddress: REACT_APP_USDT_ADDRESS,
  uniswapQuoterContractAddress: REACT_APP_UNISWAP_QUOTER_CONTRACT_ADDRESS,
});

const loadEnv = (): domain.Env => {
  const parsedEnv = envParser.parse(process.env);

  return envToDomain(parsedEnv);
};

export { loadEnv };
