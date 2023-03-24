import { FC } from "react";
import {
  POLYGON_PRIVACY_POLICY_URL,
  POLYGON_TERMS_AND_CONDITIONS_URL,
  SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD,
} from "src/constants";

import { FormData } from "src/domain";
import { useDepositLimitModalStyles } from "src/views/home/components/deposit-limit-modal/deposit-limit-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Card } from "src/views/shared/card/card.view";
import { Link } from "src/views/shared/link/link.view";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface DepositLimitModalProps {
  formData: FormData;
  onAccept: (formData: FormData, hideDepositWarning: boolean) => void;
  onCancel: () => void;
}

export const DepositLimitModal: FC<DepositLimitModalProps> = ({ formData, onAccept, onCancel }) => {
  const classes = useDepositLimitModalStyles();

  return (
    <Portal>
      <div className={classes.background}>
        <Card className={classes.card}>
          <Typography className={classes.title} type="h1">
            Warning
          </Typography>
          <Typography className={classes.warningText} type="body1">
            You are about to transfer tokens using the Polygon zkEVM Mainnet Beta. There are risks
            associated with your use of the Mainnet Beta here. You agree to the{" "}
            <Link href={POLYGON_TERMS_AND_CONDITIONS_URL}>Terms of Use</Link>, including those
            risks, and the <Link href={POLYGON_PRIVACY_POLICY_URL}>Privacy Policy</Link>
            <br></br>
            To do so, type <b className={classes.exampleText}>
              {SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}
            </b>{" "}
            below to continue.
          </Typography>
          <TextMatchForm
            onSubmit={(hideDepositWarning) => onAccept(formData, hideDepositWarning)}
            text={SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}
          />
          <button className={classes.cancelButton} onClick={onCancel} type="button">
            Cancel
          </button>
        </Card>
      </div>
    </Portal>
  );
};
