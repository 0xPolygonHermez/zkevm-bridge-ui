import React from "react";

import { ReactComponent as SuccessIcon } from "src/assets/icons/success.svg";
import { ReactComponent as ErrorIcon } from "src/assets/icons/error.svg";
import { ReactComponent as CloseIcon } from "src/assets/icons/xmark.svg";
import useSnackbarStyles from "src/views/shared/snackbar/snackbar.styles";
import { SNACKBAR_AUTO_HIDE_DURATION } from "src/constants";
import { Message } from "src/domain";

interface SnackbarProps {
  message: Message;
  onClose: () => void;
  onReport: (error: string) => void;
}

function Snackbar({ message, onClose, onReport }: SnackbarProps): JSX.Element {
  const classes = useSnackbarStyles();

  const Icon = ({ message }: { message: Message }): JSX.Element => {
    switch (message.type) {
      case "error":
      case "error-msg":
        return <ErrorIcon className={classes.messageIcon} />;
      case "success-msg":
        return <SuccessIcon className={classes.messageIcon} />;
    }
  };

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
          <Icon message={message} />
          <p className={classes.message}>{message.text}</p>
        </div>
      </div>
    );
  } else {
    const { text = "Oops, an error occurred. Would you mind reporting it?", parsed } = message;
    return (
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <Icon message={message} />
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
            <CloseIcon className={classes.closeIcon} />
          </button>
        </div>
      </div>
    );
  }
}

export default Snackbar;
