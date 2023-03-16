import { FC, MouseEvent, ReactNode } from "react";

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
          <div className={classes.text}>
            {title && <Typography type="body1">{title}</Typography>}
            {message}
          </div>
          <div className={classes.buttonsBox}>
            {showCancelButton && (
              <button className={`${classes.button} ${classes.cancelButton}`} onClick={onClose}>
                Cancel
              </button>
            )}
            <button
              className={`${classes.button} ${classes.confirmationButton}`}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </Card>
      </div>
    </Portal>
  );
};
