const FiatAmount = ({ amount, token }: { amount: number; token: "eth" | "dai" }) => {
  const rates = {
    dai: 1.02,
    eth: 2500,
  };
  const fiat = amount * rates[token];
  return <>${fiat.toFixed(2)}</>;
};

export default FiatAmount;
