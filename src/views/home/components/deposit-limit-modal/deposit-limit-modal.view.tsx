import { FC } from "react";
import { SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD } from "src/constants";

import { FormData } from "src/domain";
import { useDepositLimitModalStyles } from "src/views/home/components/deposit-limit-modal/deposit-limit-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

export type DepositLimitModalData =
  | {
      formData: FormData;
      type: "warning";
    }
  | {
      formData: FormData;
      hardLimit: number;
      type: "forbidden";
    }
  | {
      formData: FormData;
      type: "unknown-limit";
    };

interface DepositLimitModalProps {
  data: DepositLimitModalData;
  onAccept: (formData: FormData) => void;
  onCancel: () => void;
}

export const DepositLimitModal: FC<DepositLimitModalProps> = ({ data, onAccept, onCancel }) => {
  const classes = useDepositLimitModalStyles();

  return (
    <Portal>
      <div className={classes.background}>
        {(() => {
          switch (data.type) {
            case "warning": {
              return (
                <Card className={classes.card}>
                  <Typography className={classes.title} type="h1">
                    Warning
                  </Typography>
                  <Typography className={classes.warningText} type="body1">
                    You are about to deposit a large amount of tokens into the zkEVM. For safety
                    reasons, we need to ensure that you understand the risks and the possible
                    consequences of something going wrong.
                    <br></br>
                    <br></br>
                    To do so, please type{" "}
                    <b className={classes.exampleText}>{SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}</b> below:
                  </Typography>
                  <TextMatchForm
                    onSubmit={() => onAccept(data.formData)}
                    text={SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}
                  />
                  <button className={classes.cancelButton} onClick={onCancel} type="button">
                    Cancel
                  </button>
                </Card>
              );
            }
            case "forbidden": {
              return (
                <Card className={classes.card}>
                  <Typography className={classes.title} type="h1">
                    Warning
                  </Typography>
                  <Typography className={classes.forbiddenText} type="body1">
                    For safety reasons, we do not yet allow deposits of large amounts of tokens into
                    zkEVM. Please try again with an amount less than{" "}
                    <b>
                      {data.hardLimit} {data.formData.token.symbol}
                    </b>
                    .
                  </Typography>
                  <Button onClick={onCancel}>Close</Button>
                </Card>
              );
            }
            case "unknown-limit": {
              return (
                <Card className={classes.card}>
                  <Typography className={classes.title} type="h1">
                    Warning
                  </Typography>
                  <Typography className={classes.forbiddenText} type="body1">
                    We do not oficcialy support the token you are about to bridge. For safety
                    reasons, we need to ensure that you understand the risks and the possible
                    consequences of something going wrong.
                  </Typography>
                  <Button onClick={() => onAccept(data.formData)}>Yes, I want to proceed</Button>
                  <button className={classes.cancelButton} onClick={onCancel} type="button">
                    Cancel
                  </button>
                </Card>
              );
            }
          }
        })()}
      </div>
    </Portal>
  );
};
