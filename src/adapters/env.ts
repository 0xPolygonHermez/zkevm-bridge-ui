import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { getChains, getUsdcToken } from "src/constants";

interface Env {
  VITE_ETHEREUM_RPC_URL: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_BRIDGE_API_URL: string;
  VITE_USE_FIAT_EXCHANGE_RATES: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL?: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY?: string;
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS?: string;
}

const envToDomain = ({
  VITE_ETHEREUM_RPC_URL,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_BRIDGE_API_URL,
  VITE_USE_FIAT_EXCHANGE_RATES,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMNetworkId = z.number().positive().parse(Number(VITE_POLYGON_ZK_EVM_NETWORK_ID));
  const useFiatExchangeRates = z.boolean().parse(VITE_USE_FIAT_EXCHANGE_RATES === "true");

  return getChains({
    ethereum: {
      rpcUrl: VITE_ETHEREUM_RPC_URL,
      explorerUrl: VITE_ETHEREUM_EXPLORER_URL,
      bridgeContractAddress: VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
      poeContractAddress: VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
    },
    polygonZkEVM: {
      networkId: polygonZkEVMNetworkId,
      rpcUrl: VITE_POLYGON_ZK_EVM_RPC_URL,
      explorerUrl: VITE_POLYGON_ZK_EVM_EXPLORER_URL,
      bridgeContractAddress: VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
    },
  }).then((chains) => {
    const ethereumChain = chains.find((chain) => chain.key === "ethereum");
    console.log(chains[1].name);
    if (!ethereumChain) {
      throw new Error("Ethereum chain not found");
    }

    if (!useFiatExchangeRates) {
      return {
        bridgeApiUrl: VITE_BRIDGE_API_URL,
        chains,
        fiatExchangeRates: {
          areEnabled: false,
        },
      };
    }

    if (!VITE_FIAT_EXCHANGE_RATES_API_URL) {
      throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_URL env vars");
    }

    if (!VITE_FIAT_EXCHANGE_RATES_API_KEY) {
      throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_KEY env var");
    }

    if (!VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS) {
      throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS env vars");
    }

    return {
      bridgeApiUrl: VITE_BRIDGE_API_URL,
      chains,
      fiatExchangeRates: {
        areEnabled: true,
        apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
        apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
        usdcToken: getUsdcToken({
          address: VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
          chainId: ethereumChain.chainId,
        }),
      },
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_USE_FIAT_EXCHANGE_RATES: z.string(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url().optional(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string().optional(),
      VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS: z.string().length(42).optional(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(import.meta.env);

  return parsedEnv;
};

export { loadEnv };
