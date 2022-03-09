import { FC } from "react";

interface FiatAmountProps {
  amount: number;
  token: "eth" | "dai";
}

const FiatAmount: FC<FiatAmountProps> = ({ amount, token }) => {
  const rates = {
    dai: 1.02,
    eth: 2500,
  };
  const fiat = amount * rates[token];
  return <>${fiat.toFixed(2)}</>;
};

export default FiatAmount;
