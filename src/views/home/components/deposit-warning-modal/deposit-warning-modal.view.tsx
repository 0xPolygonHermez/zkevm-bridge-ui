import { FC } from "react";
import {
  DEPOSIT_CHECK_WORD,
  POLYGON_PRIVACY_POLICY_URL,
  POLYGON_TERMS_AND_CONDITIONS_URL,
  POLYGON_ZKEVM_RISK_DISCLOSURES_URL,
} from "src/constants";

import { FormData } from "src/domain";
import { useDepositWarningModalStyles } from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Card } from "src/views/shared/card/card.view";
import { ExternalLink } from "src/views/shared/external-link/external-link.view";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface DepositWarningModalProps {
  formData: FormData;
  onAccept: (formData: FormData, hideDepositWarning: boolean) => void;
  onCancel: () => void;
}

export const DepositWarningModal: FC<DepositWarningModalProps> = ({
  formData,
  onAccept,
  onCancel,
}) => {
  const classes = useDepositWarningModalStyles();

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
            <ExternalLink href={POLYGON_TERMS_AND_CONDITIONS_URL}>Terms of Use</ExternalLink>,
            including{" "}
            <ExternalLink href={POLYGON_ZKEVM_RISK_DISCLOSURES_URL}>those risks</ExternalLink>, and
            the <ExternalLink href={POLYGON_PRIVACY_POLICY_URL}>Privacy Policy</ExternalLink>.
            <br />
            <br />
            To do so, type <b className={classes.exampleText}>{DEPOSIT_CHECK_WORD}</b> below to
            continue.
          </Typography>
          <TextMatchForm
            onSubmit={(hideDepositWarning) => onAccept(formData, hideDepositWarning)}
            text={DEPOSIT_CHECK_WORD}
          />
          <button className={classes.cancelButton} onClick={onCancel} type="button">
            Cancel
          </button>
        </Card>
      </div>
    </Portal>
  );
};
