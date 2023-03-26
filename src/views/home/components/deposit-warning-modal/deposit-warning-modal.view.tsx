import { FC } from "react";
import {
  POLYGON_PRIVACY_POLICY_URL,
  POLYGON_TERMS_AND_CONDITIONS_URL,
  SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD,
} from "src/constants";

import { FormData } from "src/domain";
import { useDepositWarningModalStyles } from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ExternalLink } from "src/views/shared/external-link/external-link.view";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

export type DepositWarningModalType = "confirmation" | "above-deposit-limit";

interface DepositWarningModalProps {
  formData: FormData;
  onAccept: (formData: FormData, hideDepositWarning?: boolean) => void;
  onCancel: () => void;
  type: DepositWarningModalType;
}

export const DepositWarningModal: FC<DepositWarningModalProps> = ({
  formData,
  onAccept,
  onCancel,
  type,
}) => {
  const classes = useDepositWarningModalStyles();

  return (
    <Portal>
      <div className={classes.background}>
        <Card className={classes.card}>
          <Typography className={classes.title} type="h1">
            Warning
          </Typography>
          {type === "confirmation" ? (
            <>
              <Typography className={classes.confirmationWarningText} type="body1">
                You are about to transfer tokens using the Polygon zkEVM Mainnet Beta. There are
                risks associated with your use of the Mainnet Beta here. You agree to the{" "}
                <ExternalLink href={POLYGON_TERMS_AND_CONDITIONS_URL}>Terms of Use</ExternalLink>,
                including those risks, and the{" "}
                <ExternalLink href={POLYGON_PRIVACY_POLICY_URL}>Privacy Policy</ExternalLink>
                <br></br>
                <br></br>
                To do so, type{" "}
                <b className={classes.exampleText}>{SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}</b> below to
                continue.
              </Typography>
              <TextMatchForm
                onSubmit={(hideDepositWarning) => onAccept(formData, hideDepositWarning)}
                text={SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}
              />
              <button className={classes.cancelButton} onClick={onCancel} type="button">
                Cancel
              </button>
            </>
          ) : (
            <>
              <Typography className={classes.aboveDepositLimitWarningText} type="body1">
                Remember that Polygon zkEVM is in Mainnet Beta currently. Are you sure you want to
                bridge this amount?
              </Typography>
              <Button onClick={() => onAccept(formData)}>Yes, I want to proceed</Button>
              <button className={classes.cancelButton} onClick={onCancel} type="button">
                Cancel
              </button>
            </>
          )}
        </Card>
      </div>
    </Portal>
  );
};
