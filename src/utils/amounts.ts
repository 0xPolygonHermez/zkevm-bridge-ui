import { BigNumber, ethers } from "ethers";
import { Token } from "src/domain";

export const tokenAmountToNumber = ({
  amount,
  token,
}: {
  amount: BigNumber;
  token: Token;
}): string => {
  return ethers.utils.formatUnits(amount, token.decimals);
};
