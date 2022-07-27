import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { Chain, Currency, Token } from "src/domain";
import { erc20Tokens } from "src/assets/erc20-tokens";
import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonHermezChainIcon } from "src/assets/icons/chains/polygon-zkevm.svg";
import { cleanupCustomTokens } from "src/adapters/storage";

export const UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const UNISWAP_V2_ROUTER_02_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

export const UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const PREFERRED_CURRENCY_KEY = "currency";

export const PREFERRED_CURRENCY = Currency.USD;

export const FIAT_DISPLAY_PRECISION = 2;

export const TOKEN_DISPLAY_PRECISION = 6;

export const SNACKBAR_AUTO_HIDE_DURATION = 5000;

export const AUTO_REFRESH_RATE = 15000;

export const PAGE_SIZE = 25;

export const REPORT_ERROR_FORM_ENTRIES = {
  url: "entry.2056392454",
  network: "entry.1632331664",
  platform: "entry.259085709",
  error: "entry.1383309652",
};

export const REPORT_ERROR_FORM_URL =
  "https://docs.google.com/forms/d/1YOvhK2RfTQmYO8DGMRqN7FYxRhBZd9jB6PZ7InJirTk/viewform";

export const BRIDGE_CALL_GAS_INCREASE_PERCENTAGE = 10;

export const ETH_TOKEN_LOGO_URI =
  "https://raw.githubusercontent.com/Uniswap/interface/main/src/assets/images/ethereum-logo.png";

export const getChains = ({
  ethereum,
  polygonHermez,
}: {
  ethereum: {
    rpcUrl: string;
    explorerUrl: string;
    contractAddress: string;
  };
  polygonHermez: {
    rpcUrl: string;
    explorerUrl: string;
    contractAddress: string;
    networkId: number;
  };
}): Promise<[Chain, Chain]> => {
  const ethereumProvider = new JsonRpcProvider(ethereum.rpcUrl);
  const polygonHermezProvider = new JsonRpcProvider(polygonHermez.rpcUrl);
  return Promise.all([ethereumProvider.getNetwork(), polygonHermezProvider.getNetwork()]).then(
    ([ethereumNetwork, polygonHermezNetwork]) => [
      {
        key: "ethereum",
        networkId: 0,
        Icon: EthChainIcon,
        provider: ethereumProvider,
        chainId: ethereumNetwork.chainId,
        contractAddress: ethereum.contractAddress,
        explorerUrl: ethereum.explorerUrl,
      },
      {
        key: "polygon-zkevm",
        networkId: polygonHermez.networkId,
        Icon: PolygonHermezChainIcon,
        provider: polygonHermezProvider,
        chainId: polygonHermezNetwork.chainId,
        contractAddress: polygonHermez.contractAddress,
        explorerUrl: polygonHermez.explorerUrl,
      },
    ]
  );
};

export const getEtherToken = (chain: Chain): Token => {
  return {
    name: "Ether",
    address: ethers.constants.AddressZero,
    chainId: chain.chainId,
    symbol: "ETH",
    decimals: 18,
    logoURI: ETH_TOKEN_LOGO_URI,
  };
};

export const getChainTokens = (chain: Chain): Token[] => {
  const chainErc20Tokens: Token[] = erc20Tokens.filter((token) => token.chainId === chain.chainId);
  const tokens = [getEtherToken(chain), ...chainErc20Tokens];
  cleanupCustomTokens(tokens);
  return tokens;
};

export const getUsdcToken = ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}): Token => ({
  name: "USD Coin",
  address,
  chainId,
  symbol: "USDC",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
});
