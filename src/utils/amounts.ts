import { BigNumber } from "ethers";
import { Token } from "src/domain";

interface TokenAmountToFiatParams {
  amount: number;
  token: "eth" | "dai";
}

interface BigNumberToNumberParams {
  amount: BigNumber;
  token: Token;
}

const rates = {
  dai: 1.02,
  eth: 2500,
};

export const convertTokenAmountToFiat = ({ amount, token }: TokenAmountToFiatParams): string => {
  const fiat = amount * rates[token];
  return `$${fiat.toFixed(2)}`;
};

export const convertBigNumberToNumber = ({ amount, token }: BigNumberToNumberParams): number => {
  return Number(amount.toString()) / Math.pow(10, token.decimals);
};
