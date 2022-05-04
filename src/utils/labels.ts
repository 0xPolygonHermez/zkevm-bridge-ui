import { Transaction, Chain } from "src/domain";

export function getTransactionStatus(status: Transaction["status"]): string {
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
