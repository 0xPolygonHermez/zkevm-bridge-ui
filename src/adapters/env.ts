import { z } from "zod";

import { getChains, getUsdcToken } from "src/constants";
import * as domain from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface Env {
  VITE_BRIDGE_API_URL: string;
  VITE_ENABLE_DEPOSIT_WARNING: string;
  VITE_ENABLE_FIAT_EXCHANGE_RATES: string;
  VITE_ENABLE_OUTDATED_NETWORK_MODAL?: string;
  VITE_ENABLE_REPORT_FORM: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: string;
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_RPC_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY?: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL?: string;
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS?: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1?: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2?: string;
  VITE_OUTDATED_NETWORK_MODAL_TITLE?: string;
  VITE_OUTDATED_NETWORK_MODAL_URL?: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_REPORT_FORM_ERROR_ENTRY?: string;
  VITE_REPORT_FORM_PLATFORM_ENTRY?: string;
  VITE_REPORT_FORM_URL?: string;
  VITE_REPORT_FORM_URL_ENTRY?: string;
}

type GetFiatExchangeRatesEnvParams = Pick<
  Env,
  | "VITE_ENABLE_FIAT_EXCHANGE_RATES"
  | "VITE_FIAT_EXCHANGE_RATES_API_KEY"
  | "VITE_FIAT_EXCHANGE_RATES_API_URL"
  | "VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS"
> & {
  ethereumChain: domain.Chain;
};

type GetReportFormEnvParams = Pick<
  Env,
  | "VITE_ENABLE_REPORT_FORM"
  | "VITE_REPORT_FORM_URL"
  | "VITE_REPORT_FORM_ERROR_ENTRY"
  | "VITE_REPORT_FORM_PLATFORM_ENTRY"
  | "VITE_REPORT_FORM_URL_ENTRY"
>;

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

const getFiatExchangeRatesEnv = ({
  ethereumChain,
  VITE_ENABLE_FIAT_EXCHANGE_RATES,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
}: GetFiatExchangeRatesEnvParams): domain.Env["fiatExchangeRates"] => {
  const areFiatExchangeRatesEnabled = stringBooleanParser.parse(VITE_ENABLE_FIAT_EXCHANGE_RATES);

  if (!areFiatExchangeRatesEnabled) {
    return {
      areEnabled: false,
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
    apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
    apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
    areEnabled: true,
    usdcToken: getUsdcToken({
      address: VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
      chainId: ethereumChain.chainId,
    }),
  };
};

const getReportFormEnv = ({
  VITE_ENABLE_REPORT_FORM,
  VITE_REPORT_FORM_ERROR_ENTRY,
  VITE_REPORT_FORM_PLATFORM_ENTRY,
  VITE_REPORT_FORM_URL,
  VITE_REPORT_FORM_URL_ENTRY,
}: GetReportFormEnvParams): domain.Env["reportForm"] => {
  const isReportFormEnabled = stringBooleanParser.parse(VITE_ENABLE_REPORT_FORM);

  if (!isReportFormEnabled) {
    return {
      isEnabled: false,
    };
  }

  if (!VITE_REPORT_FORM_URL) {
    throw new Error("Missing VITE_REPORT_FORM_URL env vars");
  }

  if (!VITE_REPORT_FORM_ERROR_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_ERROR_ENTRY env vars");
  }

  if (!VITE_REPORT_FORM_PLATFORM_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_PLATFORM_ENTRY env vars");
  }

  if (!VITE_REPORT_FORM_URL_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_URL_ENTRY env vars");
  }

  return {
    entries: {
      error: VITE_REPORT_FORM_ERROR_ENTRY,
      platform: VITE_REPORT_FORM_PLATFORM_ENTRY,
      url: VITE_REPORT_FORM_URL_ENTRY,
    },
    isEnabled: true,
    url: VITE_REPORT_FORM_URL,
  };
};

const envToDomain = ({
  VITE_BRIDGE_API_URL,
  VITE_ENABLE_DEPOSIT_WARNING,
  VITE_ENABLE_FIAT_EXCHANGE_RATES,
  VITE_ENABLE_OUTDATED_NETWORK_MODAL,
  VITE_ENABLE_REPORT_FORM,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT,
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
  VITE_ETHEREUM_RPC_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2,
  VITE_OUTDATED_NETWORK_MODAL_TITLE,
  VITE_OUTDATED_NETWORK_MODAL_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_REPORT_FORM_ERROR_ENTRY,
  VITE_REPORT_FORM_PLATFORM_ENTRY,
  VITE_REPORT_FORM_URL,
  VITE_REPORT_FORM_URL_ENTRY,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMNetworkId = z.coerce.number().positive().parse(VITE_POLYGON_ZK_EVM_NETWORK_ID);
  const isOutdatedNetworkModalEnabled = stringBooleanParser.parse(
    VITE_ENABLE_OUTDATED_NETWORK_MODAL
  );
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

    return {
      bridgeApiUrl,
      chains,
      fiatExchangeRates: getFiatExchangeRatesEnv({
        ethereumChain,
        VITE_ENABLE_FIAT_EXCHANGE_RATES,
        VITE_FIAT_EXCHANGE_RATES_API_KEY,
        VITE_FIAT_EXCHANGE_RATES_API_URL,
        VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
      }),
      forceUpdateGlobalExitRootForL1,
      isDepositWarningEnabled,
      outdatedNetworkModal,
      reportForm: getReportFormEnv({
        VITE_ENABLE_REPORT_FORM,
        VITE_REPORT_FORM_ERROR_ENTRY,
        VITE_REPORT_FORM_PLATFORM_ENTRY,
        VITE_REPORT_FORM_URL,
        VITE_REPORT_FORM_URL_ENTRY,
      }),
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_ENABLE_DEPOSIT_WARNING: z.string(),
      VITE_ENABLE_FIAT_EXCHANGE_RATES: z.string(),
      VITE_ENABLE_OUTDATED_NETWORK_MODAL: z.string().optional(),
      VITE_ENABLE_REPORT_FORM: z.string(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: z.string(),
      VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string().optional(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url().optional(),
      VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS: z.string().length(42).optional(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_TITLE: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_URL: z.string().optional(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_REPORT_FORM_ERROR_ENTRY: z.string().optional(),
      VITE_REPORT_FORM_PLATFORM_ENTRY: z.string().optional(),
      VITE_REPORT_FORM_URL: z.string().optional(),
      VITE_REPORT_FORM_URL_ENTRY: z.string().optional(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  const parsedEnv = envParser.parseAsync(import.meta.env);

  return parsedEnv;
};

export { loadEnv };
