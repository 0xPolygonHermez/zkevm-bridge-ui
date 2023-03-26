import { z } from "zod";

import {
  USDC_ADDRESSES,
  WETH_ADDRESSES,
  getChains,
  getUsdcToken,
  getWethToken,
} from "src/constants";
import * as domain from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface Env {
  VITE_BRIDGE_API_URL: string;
  VITE_ENABLE_DEPOSIT_WARNING: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: string;
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_RPC_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY?: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL?: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1?: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2?: string;
  VITE_OUTDATED_NETWORK_MODAL_TITLE?: string;
  VITE_OUTDATED_NETWORK_MODAL_URL?: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_SHOW_OUTDATED_NETWORK_MODAL?: string;
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
  VITE_ENABLE_DEPOSIT_WARNING,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT,
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
  VITE_ETHEREUM_RPC_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2,
  VITE_OUTDATED_NETWORK_MODAL_TITLE,
  VITE_OUTDATED_NETWORK_MODAL_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_SHOW_OUTDATED_NETWORK_MODAL,
  VITE_USE_FIAT_EXCHANGE_RATES,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMNetworkId = z.coerce.number().positive().parse(VITE_POLYGON_ZK_EVM_NETWORK_ID);
  const useFiatExchangeRates = stringBooleanParser.parse(VITE_USE_FIAT_EXCHANGE_RATES);
  const isOutdatedNetworkModalEnabled = stringBooleanParser.parse(VITE_SHOW_OUTDATED_NETWORK_MODAL);
  const forceUpdateGlobalExitRootForL1 = stringBooleanParser.parse(
    VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT
  );
  const bridgeApiUrl = VITE_BRIDGE_API_URL;
  const outdatedNetworkModal: domain.Env["outdatedNetworkModal"] = isOutdatedNetworkModalEnabled
    ? {
        isEnabled: true,
        messageParagraph1: VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1,
        messageParagraph2: VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2,
        title: VITE_OUTDATED_NETWORK_MODAL_TITLE,
        url: VITE_OUTDATED_NETWORK_MODAL_URL,
      }
    : {
        isEnabled: false,
      };
  const isDepositWarningEnabled = stringBooleanParser.parse(VITE_ENABLE_DEPOSIT_WARNING);

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

    const usdcAddress = USDC_ADDRESSES[ethereumChain.chainId];
    const wethAddress = WETH_ADDRESSES[ethereumChain.chainId];

    if (!usdcAddress) {
      throw new Error(`USDC Address doesn't exist for chainId: ${ethereumChain.chainId}`);
    }

    if (!wethAddress) {
      throw new Error(`WETH Address doesn't exist for chainId: ${ethereumChain.chainId}`);
    }

    const usdcToken = getUsdcToken({
      address: usdcAddress,
      chainId: ethereumChain.chainId,
    });
    const wethToken = getWethToken({
      address: wethAddress,
      chainId: ethereumChain.chainId,
    });

    if (!useFiatExchangeRates) {
      return {
        bridgeApiUrl,
        chains,
        fiatExchangeRates: {
          areEnabled: false,
        },
        forceUpdateGlobalExitRootForL1,
        isDepositWarningEnabled,
        outdatedNetworkModal,
        usdcToken,
        wethToken,
      };
    }

    if (!VITE_FIAT_EXCHANGE_RATES_API_URL) {
      throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_URL env vars");
    }

    if (!VITE_FIAT_EXCHANGE_RATES_API_KEY) {
      throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_KEY env var");
    }

    return {
      bridgeApiUrl,
      chains,
      fiatExchangeRates: {
        apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
        apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
        areEnabled: true,
      },
      forceUpdateGlobalExitRootForL1,
      isDepositWarningEnabled,
      outdatedNetworkModal,
      usdcToken,
      wethToken,
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_ENABLE_DEPOSIT_WARNING: z.string(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: z.string(),
      VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string().optional(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url().optional(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_TITLE: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_URL: z.string().optional(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_SHOW_OUTDATED_NETWORK_MODAL: z.string().optional(),
      VITE_USE_FIAT_EXCHANGE_RATES: z.string(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(import.meta.env);

  return parsedEnv;
};

export { loadEnv };
