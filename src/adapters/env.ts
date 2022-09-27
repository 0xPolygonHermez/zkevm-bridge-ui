import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, getUsdcToken } from "src/constants";

interface Env {
  VITE_ETHEREUM_RPC_URL: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_USDC_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_BRIDGE_API_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY: string;
}

const envToDomain = ({
  VITE_ETHEREUM_RPC_URL,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_USDC_ADDRESS,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_BRIDGE_API_URL,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMNetworkId = z.number().positive().parse(Number(VITE_POLYGON_ZK_EVM_NETWORK_ID));

  return getChains({
    ethereum: {
      rpcUrl: VITE_ETHEREUM_RPC_URL,
      explorerUrl: VITE_ETHEREUM_EXPLORER_URL,
      contractAddress: VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
    },
    polygonZkEVM: {
      networkId: polygonZkEVMNetworkId,
      rpcUrl: VITE_POLYGON_ZK_EVM_RPC_URL,
      explorerUrl: VITE_POLYGON_ZK_EVM_EXPLORER_URL,
      contractAddress: VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
    },
  }).then((chains) => {
    const ethereumChain = chains.find((chain) => chain.key === "ethereum");
    if (!ethereumChain) {
      throw new Error("Ethereum chain not found");
    }
    return {
      bridgeApiUrl: VITE_BRIDGE_API_URL,
      fiatExchangeRates: {
        apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
        apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
        usdcToken: getUsdcToken({
          address: VITE_ETHEREUM_USDC_ADDRESS,
          chainId: ethereumChain.chainId,
        }),
      },
      chains,
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_USDC_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(import.meta.env);

  return parsedEnv;
};

export { loadEnv };
