import { FC } from "react";
import { ReactComponent as EthToken } from "src/assets/tokens/eth.svg";
import { ReactComponent as DaiToken } from "src/assets/tokens/dai.svg";

interface TokenIconProps {
  token: "eth" | "dai";
  className?: string;
}

const tokenIcons = {
  eth: EthToken,
  dai: DaiToken,
};
const TokenIcon: FC<TokenIconProps> = ({ token, className }) => {
  const Icon = tokenIcons[token] || tokenIcons["eth"];
  return <Icon className={className} />;
};

export default TokenIcon;
