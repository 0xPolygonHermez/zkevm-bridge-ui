import { FC } from "react";

import useTokenSelectorHeaderStyles from "src/views/home/components/token-selector-header/token-selector-header.styles";
import { ReactComponent as ArrowLeftIcon } from "src/assets/icons/arrow-left.svg";
import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import Typography from "src/views/shared/typography/typography.view";

interface TokenSelectorHeaderProps {
  title: string;
  onClose?: () => void;
  onGoBack?: () => void;
}

const TokenSelectorHeader: FC<TokenSelectorHeaderProps> = ({ title, onClose, onGoBack }) => {
  const classes = useTokenSelectorHeaderStyles();

  return (
    <div className={classes.tokenSelectorHeader}>
      {onGoBack && (
        <button className={classes.backButton} onClick={onGoBack}>
          <ArrowLeftIcon className={classes.backButtonIcon} />
        </button>
      )}
      <Typography type="h2">{title}</Typography>
      {onClose && (
        <button className={classes.closeButton} onClick={onClose}>
          <XMarkIcon className={classes.closeButtonIcon} />
        </button>
      )}
    </div>
  );
};

export default TokenSelectorHeader;
