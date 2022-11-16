import { FC, MouseEvent } from "react";

import usePolicyStyles from "src/views/login/components/policy/policy.styles";
import Card from "src/views/shared/card/card.view";
import Portal from "src/views/shared/portal/portal.view";
import Typography from "src/views/shared/typography/typography.view";

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
          <div className={classes.text}>
            <Typography type="body1">Welcome to the Polygon zkEVM testnet</Typography>
            <Typography type="body2">
              DISCLAIMER: This early version of the public testnet will require frequent maintenance
              and may be restarted if upgrades are needed.
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
