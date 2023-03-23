import { FC } from "react";
import { SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD } from "src/constants";

import { FormData } from "src/domain";
import { useDepositLimitModalStyles } from "src/views/home/components/deposit-limit-modal/deposit-limit-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Card } from "src/views/shared/card/card.view";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface DepositLimitModalProps {
  formData: FormData;
  onAccept: (formData: FormData) => void;
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
            You are about to deposit a large amount of tokens into the Mainnet Beta of the zkEVM.
            For safety reasons, we need to ensure that you understand its risks and the possible
            consequences of something going wrong.
            <br></br>
            <br></br>
            To do so, please type{" "}
            <b className={classes.exampleText}>{SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}</b> below:
          </Typography>
          <TextMatchForm
            onSubmit={() => onAccept(formData)}
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
