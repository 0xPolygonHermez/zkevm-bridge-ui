import { FC, MouseEvent, ReactNode } from "react";

import Card from "src/views/shared/card/card.view";
import useConfirmPopUpStyles from "src/views/shared/confirm-pop-up/confirm-pop-up.styles";
import Portal from "src/views/shared/portal/portal.view";
import Typography from "src/views/shared/typography/typography.view";

interface ConfirmPopUpProps {
  message: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

const ConfirmPopUp: FC<ConfirmPopUpProps> = ({ message, onClose, onConfirm, title }) => {
  const classes = useConfirmPopUpStyles();

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
            <Typography type="body1">{title}</Typography>
            {message}
          </div>
          <div className={classes.buttonsBox}>
            <button className={`${classes.button} ${classes.cancelButton}`} onClick={onClose}>
              Cancel
            </button>
            <button className={`${classes.button} ${classes.confirmButton}`} onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default ConfirmPopUp;
