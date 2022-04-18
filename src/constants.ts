import { ethers } from "ethers";

import { BridgeConfig, Chain, Currency, SupportedNetwork, Token } from "src/domain";
import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonHermezChainIcon } from "src/assets/icons/chains/polygon-hermez-chain.svg";

export const PREFERRED_CURRENCY_KEY = "currency";

export const PREFERRED_CURRENCY = Currency.USD;

export const SNACKBAR_AUTO_HIDE_DURATION = 5000;

export const REPORT_ERROR_FORM_ENTRIES = {
  url: "entry.2056392454",
  network: "entry.1632331664",
  platform: "entry.259085709",
  error: "entry.1383309652",
};

export const REPORT_ERROR_FORM_URL =
  "https://docs.google.com/forms/d/1YOvhK2RfTQmYO8DGMRqN7FYxRhBZd9jB6PZ7InJirTk/viewform";

export const UNISWAP_V3_POOL_FEE = 3000;

export const FIAT_EXCHANGE_RATES_API_URL = "https://api.exchangeratesapi.io/v1/latest";

export const CHAINS: Record<SupportedNetwork, Chain[]> = {
  [SupportedNetwork.LOCAL]: [
    {
      name: "Ethereum chain",
      Icon: EthChainIcon,
      chainId: 1337,
    },
    {
      name: "Polygon Hermez chain",
      Icon: PolygonHermezChainIcon,
      chainId: 1001,
    },
  ],
};

export const BRIDGE_CONFIGS: Record<SupportedNetwork, BridgeConfig> = {
  [SupportedNetwork.LOCAL]: {
    smartContractAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    apiUrl: "http://localhost:8080",
  },
};

export const UNISWAP_QUOTER_ADDRESSES: Record<SupportedNetwork, string> = {
  [SupportedNetwork.LOCAL]: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
};

export const L1_PROVIDERS: Record<SupportedNetwork, string> = {
  [SupportedNetwork.LOCAL]: "http://localhost:8123",
};

export const L2_PROVIDERS: Record<SupportedNetwork, string> = {
  [SupportedNetwork.LOCAL]: "http://localhost:8545",
};

export const ETH_TOKENS: Record<SupportedNetwork, Token> = {
  [SupportedNetwork.LOCAL]: {
    name: "Ether",
    address: ethers.constants.AddressZero,
    symbol: "ETH",
    decimals: 18,
    chainId: 1337,
    logoURI:
      "https://raw.githubusercontent.com/Uniswap/interface/main/src/assets/images/ethereum-logo.png",
  },
};

export const USDT_TOKENS: Record<SupportedNetwork, Token> = {
  [SupportedNetwork.LOCAL]: {
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  },
};
