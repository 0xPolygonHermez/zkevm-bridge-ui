import { FC } from "react";
import tokens from "src/assets/tokens/tokens.json";
import useTokenIconStyles from "src/views/shared/token-icon/token-icon.styles";

interface TokenIconProps {
  token: string;
  className?: string;
  size?: number;
}

type Token = {
  symbol: string;
  logoURI: string;
};

const TokenIcon: FC<TokenIconProps> = ({ token, className, size }) => {
  const classes = useTokenIconStyles(size || 4);
  const tokenomincs = tokens as Token[];
  const wanted = token === "eth" ? "weth" : token;
  const icon: Token | undefined = tokenomincs.find((t) => {
    return t.symbol === wanted.toUpperCase();
  });
  return <img src={icon?.logoURI} className={`${classes.icon} ${className ? className : ""}`} />;
};

export default TokenIcon;
