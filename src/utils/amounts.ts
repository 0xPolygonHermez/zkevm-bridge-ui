import { BigNumber, ethers } from "ethers";
import { Token } from "src/domain";

export const formatTokenAmount = (value: BigNumber, token: Token): string => {
  const amount = ethers.utils.formatUnits(value, token.decimals);
  const [whole, decimals] = amount.split(".");
  const trimed = decimals.length > 5 ? decimals.slice(0, 6) : decimals;
  return trimed === "0" ? whole : `${whole}.${trimed}`;
};
