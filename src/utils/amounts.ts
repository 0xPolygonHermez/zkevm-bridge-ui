import { BigNumber, ethers } from "ethers";
import { Token } from "src/domain";
import { PREFERRED_CURRENCY_PRECISION } from "src/constants";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals] = amount.split(".");
  const trimed = decimals.length > 5 ? decimals.slice(0, 6) : decimals;
  return trimed === "0" ? whole : `${whole}.${trimed}`;
};

export const roundNumber = (num: number, dec: number) => {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
};

export const roundFiat = (num: number) => {
  return (
    Math.round(num * Math.pow(10, PREFERRED_CURRENCY_PRECISION)) /
    Math.pow(10, PREFERRED_CURRENCY_PRECISION)
  );
};
