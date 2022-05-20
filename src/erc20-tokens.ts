import { Token } from "src/domain";

export const erc20Tokens: Token[] = [
  // LOCAL
  // {
  //   name: "Polygon",
  //   address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  //   chainId: 1337,
  //   symbol: "MATIC",
  //   decimals: 18,
  //   logoURI:
  //     "https://raw.githubusercontent.com/trustwallet/assets/b69af6c4c7b5734900824a6571a9ae3bbf59ec54/blockchains/polygon/info/logo.png",
  // },
  //GOERLI - INTERNAL-TESTNET
  {
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    decimals: 18,
    chainId: 5,
    logoURI:
      "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
  },
  {
    name: "Wrapped Ether",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    symbol: "WETH",
    decimals: 18,
    chainId: 5,
    logoURI:
      "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  //RINKEBY - TESTNET
  {
    name: "Dai Stablecoin",
    address: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
    symbol: "DAI",
    decimals: 18,
    chainId: 4,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  },
  {
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    decimals: 18,
    chainId: 4,
    logoURI:
      "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
  },
  {
    name: "Wrapped Ether",
    address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    symbol: "WETH",
    decimals: 18,
    chainId: 4,
    logoURI:
      "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  //MAINNET
  {
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  },
  {
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/b69af6c4c7b5734900824a6571a9ae3bbf59ec54/blockchains/polygon/info/logo.png",
  },
  {
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
  },
];
