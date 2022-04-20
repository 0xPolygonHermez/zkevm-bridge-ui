import { FC } from "react";

import useIconStyles from "src/views/shared/icon/icon.styles";

interface IconProps {
  url: string;
  className?: string;
  size?: number;
}

const Icon: FC<IconProps> = ({ url, className, size }) => {
  const classes = useIconStyles(size || 16);

  return <img src={url} className={`${classes.icon} ${className ? className : ""}`} />;
};

export default Icon;
