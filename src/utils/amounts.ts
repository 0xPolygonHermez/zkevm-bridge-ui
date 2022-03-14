interface FiatAmountProps {
  amount: number;
  token: "eth" | "dai";
}

const rates = {
  dai: 1.02,
  eth: 2500,
};

export const fiatAmount = ({ amount, token }: FiatAmountProps): string => {
  const fiat = amount * rates[token];
  return `$${fiat.toFixed(2)}`;
};
