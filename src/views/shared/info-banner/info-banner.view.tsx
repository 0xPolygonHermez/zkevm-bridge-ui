import { FC } from "react";

import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import { useInfoBannerStyles } from "src/views/shared/info-banner/info-banner.styles";
import { Typography } from "src/views/shared/typography/typography.view";

interface InfoBannerProps {
  className?: string;
  message: string;
}

export const InfoBanner: FC<InfoBannerProps> = ({ className, message }) => {
  const classes = useInfoBannerStyles();

  return (
    <div className={`${classes.infoBanner} ${className ?? ""}`}>
      <InfoIcon />
      <Typography className={classes.message} type="body2">
        {message}
      </Typography>
    </div>
  );
};
