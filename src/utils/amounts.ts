import { BigNumber, ethers } from "ethers";

export const trimDecimals = (value: BigNumber): string => {
  const amount = ethers.utils.formatEther(value);
  const decimals = amount.split(".")[1];
  const trimed = decimals.length > 5 ? decimals.slice(0, 6) : decimals;
  return `${amount.split(".")[0]}.${trimed}`;
};
