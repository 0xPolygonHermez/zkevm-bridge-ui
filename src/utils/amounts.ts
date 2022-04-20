import { BigNumber } from "ethers";
import { Token } from "src/domain";

const rates = {
  dai: 1.02,
  eth: 2500,
};

export const convertTokenAmountToFiat = ({
  amount,
  token,
}: {
  amount: number;
  token: "eth" | "dai";
}): string => {
  const fiat = amount * rates[token];
  return `$${fiat.toFixed(2)}`;
};

export const tokenAmountToNumber = ({
  amount,
  token,
}: {
  amount: BigNumber;
  token: Token;
}): number => {
  return Number(amount.toString()) / Math.pow(10, token.decimals);
};
