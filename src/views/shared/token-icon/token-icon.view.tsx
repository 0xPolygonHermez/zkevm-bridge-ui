import { FC } from "react";

import useTokenIconStyles from "src/views/shared/token-icon/token-icon.styles";

interface TokenIconProps {
  logoURI: string;
  className?: string;
  size?: number;
}

const TokenIcon: FC<TokenIconProps> = ({ logoURI, className, size }) => {
  const classes = useTokenIconStyles(size || 16);

  return <img src={logoURI} className={`${classes.icon} ${className ? className : ""}`} />;
};

export default TokenIcon;
