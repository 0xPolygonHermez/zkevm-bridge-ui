import { Bridge, Chain, Currency, EthereumChainId } from "src/domain";

export function getBridgeStatus(status: Bridge["status"]): string {
  switch (status) {
    case "pending":
      return "Processing";
    case "initiated":
      return "Initiated";
    case "on-hold":
      return "On Hold";
    case "completed":
      return "Completed";
  }
}

export function getNetworkName(chain: Chain): string | undefined {
  switch (chain.chainId) {
    case EthereumChainId.MAINNET:
      return "Ethereum";
    case EthereumChainId.GOERLI:
      return "Goerli";
    default:
      return undefined;
  }
}

export function getDeploymentName(chain: Chain): string | undefined {
  switch (chain.chainId) {
    case EthereumChainId.MAINNET:
      return "Mainnet";
    case EthereumChainId.GOERLI:
      return "Internal Testnet";
    default:
      return undefined;
  }
}

type CurrencySymbol = "€" | "$" | "¥" | "£";

export function getCurrencySymbol(currency: Currency): CurrencySymbol {
  switch (currency) {
    case Currency.EUR:
      return "€";
    case Currency.USD:
      return "$";
    case Currency.GBP:
      return "£";
    case Currency.JPY:
    case Currency.CNY:
      return "¥";
  }
}
