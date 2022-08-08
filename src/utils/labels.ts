import { Bridge, Chain, Currency } from "src/domain";

export function getBridgeStatus(status: Bridge["status"]): string {
  switch (status) {
    case "initiated":
      return "Initiated";
    case "on-hold":
      return "On Hold";
    case "completed":
      return "Completed";
  }
}

export function getChainName(chain: Chain): string {
  switch (chain.key) {
    case "ethereum":
      return "Ethereum";
    case "polygon-zkevm":
      return "Polygon zkEVM";
  }
}

export function getNetworkName(chain: Chain) {
  switch (chain.chainId) {
    case 1:
      return "Mainnet" as const;
    case 4:
      return "Rinkeby" as const;
    case 5:
      return "Goerli" as const;
    default:
      return undefined;
  }
}

export function getDeploymentName(chain: Chain): string | undefined {
  switch (chain.chainId) {
    case 1:
      return "Mainnet";
    case 4:
      return "Testnet";
    case 5:
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
