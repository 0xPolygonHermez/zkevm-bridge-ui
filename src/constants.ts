import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";

import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonZkEVMChainIcon } from "src/assets/icons/chains/polygon-zkevm.svg";
import { Chain, Currency, EthereumChain, ProviderError, Token, ZkEVMChain } from "src/domain";
import { ProofOfEfficiency__factory } from "src/types/contracts/proof-of-efficiency";
import { getEthereumNetworkName } from "src/utils/labels";

export const DAI_PERMIT_TYPEHASH =
  "0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb";

export const EIP_2612_PERMIT_TYPEHASH =
  "0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9";

export const EIP_2612_DOMAIN_TYPEHASH =
  "0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f";

export const UNISWAP_DOMAIN_TYPEHASH =
  "0x8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a866";

export const UNISWAP_V2_ROUTER_02_CONTRACT_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const UNISWAP_V2_ROUTER_02_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

export const UNISWAP_V2_ROUTER_02_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const PREFERRED_CURRENCY_KEY = "currency";

export const CUSTOM_TOKENS_KEY = "customTokens";

export const PENDING_TXS_KEY = "pendingTxs";

export const POLICY_CHECK_KEY = "policyCheck";

export const DISMISSED_DEPOSIT_WARNING_KEY = "dismissedDepositWarning";

export const PREFERRED_CURRENCY = Currency.USD;

export const FIAT_DISPLAY_PRECISION = 2;

export const TOKEN_DISPLAY_PRECISION = 6;

export const SNACKBAR_AUTO_HIDE_DURATION = 5 * 1000; //5s in ms

export const AUTO_REFRESH_RATE = 10 * 1000; //10s in ms

export const PAGE_SIZE = 25;

export const PENDING_TX_TIMEOUT = 30 * 60 * 1000; // 30min in ms

export const BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE = 20; // 20%

export const BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE = 100000;

export const GAS_PRICE_INCREASE_PERCENTAGE = 50; // 50%

export const DEPOSIT_CHECK_WORD = "I understand";

export const ETH_TOKEN_LOGO_URI =
  "https://raw.githubusercontent.com/Uniswap/interface/main/packages/ui/src/assets/logos/png/ethereum-logo.png";

export const POLYGON_SUPPORT_URL = "https://support.polygon.technology";

export const POLYGON_TERMS_AND_CONDITIONS_URL = "https://polygon.technology/terms-of-use";

export const POLYGON_PRIVACY_POLICY_URL = "https://polygon.technology/privacy-policy";

export const POLYGON_ZKEVM_RISK_DISCLOSURES_URL =
  "https://wiki.polygon.technology/docs/zkEVM/#polygon-zkevm-risk-disclosures";

export const TOKEN_BLACKLIST = [
  // WETH
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
];

export const getChains = ({
  ethereum,
  polygonZkEVM,
}: {
  ethereum: {
    bridgeContractAddress: string;
    explorerUrl: string;
    poeContractAddress: string;
    rpcUrl: string;
  };
  polygonZkEVM: {
    bridgeContractAddress: string;
    explorerUrl: string;
    networkId: number;
    rpcUrl: string;
  };
}): Promise<[EthereumChain, ZkEVMChain]> => {
  const ethereumProvider = new StaticJsonRpcProvider(ethereum.rpcUrl);
  const polygonZkEVMProvider = new StaticJsonRpcProvider(polygonZkEVM.rpcUrl);
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
      bridgeContractAddress: ethereum.bridgeContractAddress,
      chainId: ethereumNetwork.chainId,
      explorerUrl: ethereum.explorerUrl,
      Icon: EthChainIcon,
      key: "ethereum",
      name: getEthereumNetworkName(ethereumNetwork.chainId),
      nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
      },
      networkId: 0,
      poeContractAddress: ethereum.poeContractAddress,
      provider: ethereumProvider,
    },
    {
      bridgeContractAddress: polygonZkEVM.bridgeContractAddress,
      chainId: polygonZkEVMNetwork.chainId,
      explorerUrl: polygonZkEVM.explorerUrl,
      Icon: PolygonZkEVMChainIcon,
      key: "polygon-zkevm",
      name: polygonZkEVMNetworkName,
      nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
      },
      networkId: polygonZkEVM.networkId,
      provider: polygonZkEVMProvider,
    },
  ]);
};

export const getEtherToken = (chain: Chain): Token => {
  return {
    address: ethers.constants.AddressZero,
    chainId: chain.chainId,
    decimals: 18,
    logoURI: ETH_TOKEN_LOGO_URI,
    name: "Ether",
    symbol: "ETH",
  };
};

export const getUsdcToken = ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}): Token => ({
  address,
  chainId,
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  name: "USD Coin",
  symbol: "USDC",
});
