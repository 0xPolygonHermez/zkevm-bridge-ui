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

type CurrencySymbol = "€" | "$" | "¥" | "£";

export function getCurrencySymbol(currency: Currency): CurrencySymbol {
  switch (currency) {
    case Currency.EUR:
      return "€";
    case Currency.USD:
      return "$";
    case Currency.JPY:
      return "¥";
    case Currency.GBP:
      return "£";
    case Currency.CNY:
      return "¥";
  }
}
