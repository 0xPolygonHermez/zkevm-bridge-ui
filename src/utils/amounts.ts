import { BigNumber, ethers } from "ethers";
import { parseUnits, formatUnits } from "ethers/lib/utils";

import { Token } from "src/domain";
import {
  TOKEN_DISPLAY_PRECISION,
  PREFERRED_CURRENCY_DISPLAY_PRECISION,
  PREFERRED_CURRENCY_ARITHMETIC_PRECISION,
} from "src/constants";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals = ""] = amount.split(".");
  const trimed =
    decimals.length > TOKEN_DISPLAY_PRECISION
      ? decimals.slice(0, TOKEN_DISPLAY_PRECISION)
      : decimals;
  return trimed === "" || trimed === "0" ? whole : `${whole}.${trimed}`;
};

export const formatFiatAmount = (value: BigNumber): string => {
  const [whole, decimals = ""] = fiatBigNumberToString(value).split(".");
  const trimed =
    decimals.length > PREFERRED_CURRENCY_DISPLAY_PRECISION
      ? decimals.slice(0, PREFERRED_CURRENCY_DISPLAY_PRECISION)
      : decimals;
  return trimed === "" || trimed === "0" ? whole : `${whole}.${trimed}`;
};

export const fiatStringToBigNumber = (value: string): BigNumber => {
  return parseUnits(value, PREFERRED_CURRENCY_ARITHMETIC_PRECISION);
};

export const fiatBigNumberToString = (value: BigNumber): string => {
  return formatUnits(value, PREFERRED_CURRENCY_ARITHMETIC_PRECISION);
};

interface Amount {
  value: BigNumber;
  precision: number;
}

export const multiplyAmounts = (a: Amount, b: Amount, outputPrecision: number): BigNumber => {
  const result = formatUnits(a.value.mul(b.value), a.precision + b.precision);
  const [whole, decimals = ""] = result.split(".");
  const trimedDecimals =
    decimals.length > outputPrecision ? decimals.slice(0, outputPrecision) : decimals;
  return parseUnits(`${whole}.${trimedDecimals}`, outputPrecision);
};
