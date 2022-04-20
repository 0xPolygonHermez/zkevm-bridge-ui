import { Chain, Currency } from "src/domain";
import { ReactComponent as EthChainIcon } from "src/assets/chains/ethereum.svg";
import { ReactComponent as PolygonHermezChainIcon } from "src/assets/chains/polygon-hermez-chain.svg";

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

export const USDT_DECIMALS = 6;

export const UNISWAP_V3_POOL_FEE = 3000;

export const FIAT_EXCHANGE_RATES_API_URL = "https://api.exchangeratesapi.io/v1/latest";

export const chains: Chain[] = [
  { name: "Ethereum chain", icon: EthChainIcon, chainId: 1337 },
  { name: "Polygon Hermez chain", icon: PolygonHermezChainIcon, chainId: 1001 },
];
