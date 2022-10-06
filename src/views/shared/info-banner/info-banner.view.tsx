import { FC } from "react";

import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import useInfoBannerStyles from "src/views/shared/info-banner/info-banner.styles";
import Typography from "src/views/shared/typography/typography.view";

interface InfoBannerProps {
  message: string;
  className?: string;
}

const InfoBanner: FC<InfoBannerProps> = ({ message, className }) => {
  const classes = useInfoBannerStyles();

  return (
    <div className={`${classes.infoBanner} ${className ?? ""}`}>
      <InfoIcon />
      <Typography type="body2">{message}</Typography>
    </div>
  );
};

export default InfoBanner;
