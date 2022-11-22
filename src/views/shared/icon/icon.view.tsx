import { FC } from "react";

import useIconStyles from "src/views/shared/icon/icon.styles";

interface IconProps {
  className?: string;
  size?: number;
  url: string;
}

const Icon: FC<IconProps> = ({ className, size, url }) => {
  const classes = useIconStyles(size || 16);

  return <img className={`${classes.icon} ${className ? className : ""}`} src={url} />;
};

export default Icon;
