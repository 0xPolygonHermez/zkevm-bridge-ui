import { FC } from "react";
import tokens from "src/assets/tokens/tokens.json";
import useTokenIconStyles from "src/views/shared/token-icon/token-icon.styles";

interface TokenIconProps {
  token: string;
  className?: string;
  size?: number;
}

interface Token {
  symbol: string;
  logoURI: string;
}

const TokenIcon: FC<TokenIconProps> = ({ token, className, size }) => {
  const classes = useTokenIconStyles(size || 16);
  const tokenList = tokens;
  const wanted = token === "eth" ? "weth" : token;
  const icon: Token | undefined = tokenList.find((t) => {
    return t.symbol.toUpperCase() === wanted.toUpperCase();
  });

  return <img src={icon?.logoURI} className={`${classes.icon} ${className ? className : ""}`} />;
};

export default TokenIcon;
