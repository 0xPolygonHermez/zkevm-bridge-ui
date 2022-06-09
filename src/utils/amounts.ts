import { BigNumber, ethers } from "ethers";
import { parseUnits, formatUnits } from "ethers/lib/utils";

import { Token } from "src/domain";
import { TOKEN_DISPLAY_PRECISION, FIAT_DISPLAY_PRECISION } from "src/constants";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals = ""] = amount.split(".");
  const trimmed =
    decimals.length > TOKEN_DISPLAY_PRECISION
      ? decimals.slice(0, TOKEN_DISPLAY_PRECISION)
      : decimals;
  return trimmed === "" || trimmed === "0" ? whole : `${whole}.${trimmed}`;
};

export const formatFiatAmount = (value: BigNumber): string => {
  const [whole, decimals = ""] = fiatBigNumberToString(value).split(".");
  const trimmed =
    decimals.length > FIAT_DISPLAY_PRECISION ? decimals.slice(0, FIAT_DISPLAY_PRECISION) : decimals;
  return trimmed === "" || trimmed === "0" ? whole : `${whole}.${trimmed}`;
};

export const fiatStringToBigNumber = (value: string): BigNumber => {
  return parseUnits(value, FIAT_DISPLAY_PRECISION);
};

export const fiatBigNumberToString = (value: BigNumber): string => {
  return formatUnits(value, FIAT_DISPLAY_PRECISION);
};

interface Amount {
  value: BigNumber;
  precision: number;
}

export const multiplyAmounts = (a: Amount, b: Amount, outputPrecision: number): BigNumber => {
  const result = formatUnits(a.value.mul(b.value), a.precision + b.precision);
  const [whole, decimals = ""] = result.split(".");
  const trimmedDecimals =
    decimals.length > outputPrecision ? decimals.slice(0, outputPrecision) : decimals;
  return parseUnits(`${whole}.${trimmedDecimals}`, outputPrecision);
};
