import { FC } from "react";

import { useIconStyles } from "src/views/shared/icon/icon.styles";

interface IconProps {
  className?: string;
  isRounded?: boolean;
  size?: number;
  url: string;
}

export const Icon: FC<IconProps> = ({ className, isRounded, size, url }) => {
  const classes = useIconStyles(size || 16);

  return isRounded ? (
    <div className={`${classes.roundedWrapper} ${className ? className : ""}`}>
      <img className={classes.icon} src={url} />
    </div>
  ) : (
    <img className={`${classes.icon} ${className ? className : ""}`} src={url} />
  );
};
