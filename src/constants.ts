import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonZkEVMChainIcon } from "src/assets/icons/chains/polygon-zkevm.svg";
import { ProofOfEfficiency__factory } from "src/types/contracts/proof-of-efficiency";
import { ProviderError } from "src/adapters/error";
import { Chain, Currency, EthereumChain, EthereumChainId, Token, ZkEVMChain } from "src/domain";

export const UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const UNISWAP_V2_ROUTER_02_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

export const UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const PREFERRED_CURRENCY_KEY = "currency";

export const CUSTOM_TOKENS_KEY = "customTokens";

export const PENDING_TXS_KEY = "pendingTxs";

export const POLICY_CHECK_KEY = "policyCheck";

export const PREFERRED_CURRENCY = Currency.USD;

export const FIAT_DISPLAY_PRECISION = 2;

export const TOKEN_DISPLAY_PRECISION = 6;

export const SNACKBAR_AUTO_HIDE_DURATION = 5 * 1000; //5s in ms

export const AUTO_REFRESH_RATE = 10 * 1000; //10s in ms

export const PAGE_SIZE = 25;

export const PENDING_TX_TIMEOUT = 30 * 60 * 1000; // 30min in ms

export const BRIDGE_CALL_GAS_INCREASE_PERCENTAGE = 20; // 20%

export const REPORT_ERROR_FORM_ENTRIES = {
  url: "entry.2056392454",
  network: "entry.1632331664",
  platform: "entry.259085709",
  error: "entry.1383309652",
};

export const REPORT_ERROR_FORM_URL =
  "https://docs.google.com/forms/d/1YOvhK2RfTQmYO8DGMRqN7FYxRhBZd9jB6PZ7InJirTk/viewform";

export const ETH_TOKEN_LOGO_URI =
  "https://raw.githubusercontent.com/Uniswap/interface/main/src/assets/images/ethereum-logo.png";

export const getChains = ({
  ethereum,
  polygonZkEVM,
}: {
  ethereum: {
    rpcUrl: string;
    explorerUrl: string;
    bridgeContractAddress: string;
    poeContractAddress: string;
  };
  polygonZkEVM: {
    rpcUrl: string;
    explorerUrl: string;
    bridgeContractAddress: string;
    networkId: number;
  };
}): Promise<[EthereumChain, ZkEVMChain]> => {
  const ethereumProvider = new JsonRpcProvider(ethereum.rpcUrl);
  const polygonZkEVMProvider = new JsonRpcProvider(polygonZkEVM.rpcUrl);
  const poeContract = ProofOfEfficiency__factory.connect(
    ethereum.poeContractAddress,
    ethereumProvider
  );

  return Promise.all([
    ethereumProvider.getNetwork().catch(() => Promise.reject(ProviderError.Ethereum)),
    polygonZkEVMProvider.getNetwork().catch(() => Promise.reject(ProviderError.PolygonZkEVM)),
    poeContract.networkName().catch(() => Promise.reject(ProviderError.Ethereum)),
  ]).then(([ethereumNetwork, polygonZkEVMNetwork, polygonZkEVMNetworkName]) => [
    {
      key: "ethereum",
      name: EthereumChainId.GOERLI === ethereumNetwork.chainId ? "Ethereum Goerli" : "Ethereum",
      networkId: 0,
      Icon: EthChainIcon,
      provider: ethereumProvider,
      chainId: ethereumNetwork.chainId,
      bridgeContractAddress: ethereum.bridgeContractAddress,
      explorerUrl: ethereum.explorerUrl,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      poeContractAddress: ethereum.poeContractAddress,
    },
    {
      key: "polygon-zkevm",
      name: polygonZkEVMNetworkName,
      networkId: polygonZkEVM.networkId,
      Icon: PolygonZkEVMChainIcon,
      provider: polygonZkEVMProvider,
      chainId: polygonZkEVMNetwork.chainId,
      bridgeContractAddress: polygonZkEVM.bridgeContractAddress,
      explorerUrl: polygonZkEVM.explorerUrl,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    },
  ]);
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
