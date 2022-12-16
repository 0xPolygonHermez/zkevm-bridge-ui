import { z } from "zod";

import { getChains, getUsdcToken } from "src/constants";
import * as domain from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface Env {
  VITE_BRIDGE_API_URL: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_RPC_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY?: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL?: string;
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS?: string;
  VITE_OUTDATED_NETWORK_MESSAGE?: string;
  VITE_OUTDATED_NETWORK_TITLE?: string;
  VITE_OUTDATED_NETWORK_URL?: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_USE_FIAT_EXCHANGE_RATES: string;
}

const stringBooleanParser = StrictSchema<string, boolean>()(
  z.string().transform((value, context) => {
    switch (value) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      default: {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: "The provided string input can't be parsed as a boolean",
        });
        return z.NEVER;
      }
    }
  })
);

const envToDomain = ({
  VITE_BRIDGE_API_URL,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
  VITE_ETHEREUM_RPC_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
  VITE_OUTDATED_NETWORK_MESSAGE,
  VITE_OUTDATED_NETWORK_TITLE,
  VITE_OUTDATED_NETWORK_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_USE_FIAT_EXCHANGE_RATES,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMNetworkId = z.number().positive().parse(Number(VITE_POLYGON_ZK_EVM_NETWORK_ID));
  const useFiatExchangeRates = stringBooleanParser.parse(VITE_USE_FIAT_EXCHANGE_RATES);
  const bridgeApiUrl = VITE_BRIDGE_API_URL;
  const outdatedNetwork: domain.Env["outdatedNetwork"] = {
    message: VITE_OUTDATED_NETWORK_MESSAGE,
    title: VITE_OUTDATED_NETWORK_TITLE,
    url: VITE_OUTDATED_NETWORK_URL,
  };

  return getChains({
    ethereum: {
      bridgeContractAddress: VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
      explorerUrl: VITE_ETHEREUM_EXPLORER_URL,
      poeContractAddress: VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
      rpcUrl: VITE_ETHEREUM_RPC_URL,
    },
    polygonZkEVM: {
      bridgeContractAddress: VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
      explorerUrl: VITE_POLYGON_ZK_EVM_EXPLORER_URL,
      networkId: polygonZkEVMNetworkId,
      rpcUrl: VITE_POLYGON_ZK_EVM_RPC_URL,
    },
  }).then((chains) => {
    const ethereumChain = chains.find((chain) => chain.key === "ethereum");

    if (!ethereumChain) {
      throw new Error("Ethereum chain not found");
    }

    if (!useFiatExchangeRates) {
      return {
        bridgeApiUrl,
        chains,
        fiatExchangeRates: {
          areEnabled: false,
        },
        outdatedNetwork,
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
      bridgeApiUrl,
      chains,
      fiatExchangeRates: {
        apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
        apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
        areEnabled: true,
        usdcToken: getUsdcToken({
          address: VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
          chainId: ethereumChain.chainId,
        }),
      },
      outdatedNetwork,
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string().optional(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url().optional(),
      VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS: z.string().length(42).optional(),
      VITE_OUTDATED_NETWORK_MESSAGE: z.string().optional(),
      VITE_OUTDATED_NETWORK_TITLE: z.string().optional(),
      VITE_OUTDATED_NETWORK_URL: z.string().optional(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_USE_FIAT_EXCHANGE_RATES: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(import.meta.env);

  return parsedEnv;
};

export { loadEnv };
