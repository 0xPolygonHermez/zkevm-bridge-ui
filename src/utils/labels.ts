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
    case "polygon-hermez":
      return "Polygon Hermez";
  }
}

export function getCurrencySymbol(currency: Currency) {
  switch (currency) {
    case Currency.EUR:
      return "€" as const;
    case Currency.USD:
      return "$" as const;
    case Currency.JPY:
      return "¥" as const;
    case Currency.GBP:
      return "£" as const;
    case Currency.CNY:
      return "¥" as const;
  }
}
