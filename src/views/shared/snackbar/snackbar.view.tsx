import React from "react";

import { ReactComponent as ErrorIcon } from "src/assets/icons/error.svg";
import { ReactComponent as CloseIconLight } from "src/assets/icons/close-white.svg";
import useSnackbarStyles from "src/views/shared/snackbar/snackbar.styles";
//domain
import { Message } from "src/domain";

const SNACKBAR_AUTO_HIDE_DURATION = 5000;

interface SnackbarProps {
  message: Message;
  onClose: () => void;
  onReport: (error: string) => void;
}

function Snackbar({ message, onClose, onReport }: SnackbarProps): JSX.Element {
  const classes = useSnackbarStyles();

  React.useEffect(() => {
    if (message.type !== "error") {
      const closingTimeoutId = setTimeout(onClose, SNACKBAR_AUTO_HIDE_DURATION);

      return () => clearTimeout(closingTimeoutId);
    }
  }, [message.type, onClose]);

  if (message.type !== "error") {
    return (
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <p className={classes.message}>{message.text}</p>
        </div>
      </div>
    );
  } else {
    const { text = "Oops, an error occurred. Would you mind reporting it?", parsed } = message;
    return (
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <ErrorIcon />
          <p className={classes.message}>{text}</p>
          <button
            className={classes.reportButton}
            onClick={() => {
              onReport(parsed);
            }}
          >
            Report
          </button>
          <button className={classes.closeButton} onClick={onClose}>
            <CloseIconLight />
          </button>
        </div>
      </div>
    );
  }
}

export default Snackbar;
