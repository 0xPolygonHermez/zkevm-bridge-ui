import { FC, MouseEvent } from "react";

import usePolicyStyles from "src/views/login/components/policy/policy.styles";
import Typography from "src/views/shared/typography/typography.view";
import Portal from "src/views/shared/portal/portal.view";
import Card from "src/views/shared/card/card.view";

interface PolicyProps {
  onClose: () => void;
  onConnect: () => void;
}

const Policy: FC<PolicyProps> = ({ onClose, onConnect }) => {
  const classes = usePolicyStyles();

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div className={classes.background} onMouseDown={onOutsideClick}>
        <Card className={classes.card}>
          <div className={classes.header}>
            <Typography type="body2">
              By connecting a wallet, you agree to Polygon zkEVM Terms of Service and acknowledge
              that you have read and understand the Polygon zkEVM Protocol Disclaimer.
            </Typography>
          </div>
          <div className={classes.buttonsBox}>
            <button className={`${classes.button} ${classes.cancelButton}`} onClick={onClose}>
              Cancel
            </button>
            <button className={`${classes.button} ${classes.connectButton}`} onClick={onConnect}>
              Connect
            </button>
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default Policy;
