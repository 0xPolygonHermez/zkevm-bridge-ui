import { FC, MouseEvent, ReactNode } from "react";
import { Button } from "src/views/shared/button/button.view";

import { Card } from "src/views/shared/card/card.view";
import { useConfirmationModalStyles } from "src/views/shared/confirmation-modal/confirmation-modal.styles";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface ConfirmationModalProps {
  message: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  showCancelButton?: boolean;
  title?: string;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  message,
  onClose,
  onConfirm,
  showCancelButton = true,
  title,
}) => {
  const classes = useConfirmationModalStyles();

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div className={classes.background} onMouseDown={onOutsideClick}>
        <Card className={classes.card}>
          {title && (
            <Typography className={classes.title} type="h1">
              {title}
            </Typography>
          )}
          <div className={classes.textContainer}>{message}</div>
          <Button onClick={onConfirm}>Confirm</Button>
          {showCancelButton && (
            <button className={classes.cancelButton} onClick={onClose}>
              Cancel
            </button>
          )}
        </Card>
      </div>
    </Portal>
  );
};
