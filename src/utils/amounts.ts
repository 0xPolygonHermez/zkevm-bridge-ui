import { BigNumber, ethers } from "ethers";
import { parseUnits, formatUnits } from "ethers/lib/utils";

import { Token } from "src/domain";
import { PREFERRED_CURRENCY_PRECISION } from "src/constants";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals] = amount.split(".");
  const trimed = decimals.length > 5 ? decimals.slice(0, 6) : decimals;
  return trimed === "0" ? whole : `${whole}.${trimed}`;
};

export const formatFiatAmount = (value: BigNumber): string => {
  const [whole, decimals] = fiatBigNumberToString(value).split(".");
  const trimed =
    decimals.length > PREFERRED_CURRENCY_PRECISION
      ? decimals.slice(0, PREFERRED_CURRENCY_PRECISION + 1)
      : decimals;
  return trimed === "0" ? whole : `${whole}.${trimed}`;
};

export const fiatStringToBigNumber = (rate: string): BigNumber => {
  return parseUnits(rate);
};

export const fiatBigNumberToString = (rate: BigNumber): string => {
  return formatUnits(rate);
};
