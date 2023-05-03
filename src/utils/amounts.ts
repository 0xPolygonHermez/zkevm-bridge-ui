import { BigNumber, ethers } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { TOKEN_DISPLAY_PRECISION } from "src/constants";
import { Token } from "src/domain";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals = ""] = amount.split(".");
  const trimmed =
    decimals.length > TOKEN_DISPLAY_PRECISION
      ? decimals.slice(0, TOKEN_DISPLAY_PRECISION)
      : decimals;
  return trimmed === "" || trimmed === "0" ? whole : `${whole}.${trimmed}`;
};

interface Amount {
  precision: number;
  value: BigNumber;
}

export const multiplyAmounts = (a: Amount, b: Amount, outputPrecision: number): BigNumber => {
  const result = formatUnits(a.value.mul(b.value), a.precision + b.precision);
  const [whole, decimals = ""] = result.split(".");
  const trimmedDecimals =
    decimals.length > outputPrecision ? decimals.slice(0, outputPrecision) : decimals;
  return parseUnits(`${whole}.${trimmedDecimals}`, outputPrecision);
};
