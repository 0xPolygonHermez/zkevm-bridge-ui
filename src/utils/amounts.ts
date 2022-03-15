interface TokenAmountToFiatParams {
  amount: number;
  token: "eth" | "dai";
}

const rates = {
  dai: 1.02,
  eth: 2500,
};

export const convertTokenAmountToFiat = ({ amount, token }: TokenAmountToFiatParams): string => {
  const fiat = amount * rates[token];
  return `$${fiat.toFixed(2)}`;
};
