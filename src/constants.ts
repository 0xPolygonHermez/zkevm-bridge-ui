import { ethers } from "ethers";

import { Chain, Currency, Token } from "src/domain";
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

export const getChains = ({
  ethereumChainId,
  polygonHermezChainId,
  bridgePolygonHermezNetworkId,
}: {
  ethereumChainId: number;
  polygonHermezChainId: number;
  bridgePolygonHermezNetworkId: number;
}): [Chain, Chain] => [
  {
    name: "ethereum",
    label: "Ethereum chain",
    chainId: ethereumChainId,
    Icon: EthChainIcon,
    bridgeNetworkId: 0,
  },
  {
    name: "polygon-hermez",
    label: "Polygon Hermez chain",
    chainId: polygonHermezChainId,
    Icon: PolygonHermezChainIcon,
    bridgeNetworkId: bridgePolygonHermezNetworkId,
  },
];

export const getEthToken = ({ chainId }: { chainId: number }): Token => ({
  name: "Ether",
  address: ethers.constants.AddressZero,
  symbol: "ETH",
  decimals: 18,
  chainId,
  logoURI:
    "https://raw.githubusercontent.com/Uniswap/interface/main/src/assets/images/ethereum-logo.png",
});

export const getUsdtToken = ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}): Token => ({
  name: "Tether USD",
  address,
  symbol: "USDT",
  decimals: 6,
  chainId,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
});
