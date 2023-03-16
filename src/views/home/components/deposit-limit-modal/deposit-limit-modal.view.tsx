import { FC } from "react";
import { SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD } from "src/constants";

import { FormData } from "src/domain";
import { useDepositLimitModalStyles } from "src/views/home/components/deposit-limit-modal/deposit-limit-modal.styles";
import { TextMatchForm } from "src/views/home/components/text-match-form/text-match-form.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { Portal } from "src/views/shared/portal/portal.view";

export type DepositLimitModalData =
  | {
      formData: FormData;
      type: "warning";
    }
  | {
      formData: FormData;
      hardLimit: number;
      type: "forbidden";
    };

interface DepositLimitProps {
  data: DepositLimitModalData;
  onAccept: (formData: FormData) => void;
  onCancel: () => void;
}

export const DepositLimitModal: FC<DepositLimitProps> = ({ data, onAccept, onCancel }) => {
  const classes = useDepositLimitModalStyles();

  return (
    <Portal>
      <div className={classes.background}>
        {data.type === "warning" ? (
          <Card className={classes.card}>
            <h1 className={classes.title}>Warning</h1>
            <p className={classes.warningText}>
              You are about to deposit a large amount of tokens into the zkEVM. For safety reasons,
              we need to ensure that you understand the risks and the possible consequences of
              something going wrong.
              <br></br>
              <br></br>
              To do so, please type{" "}
              <b className={classes.exampleText}>{SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}</b> below:
            </p>
            <TextMatchForm
              onSubmit={() => onAccept(data.formData)}
              text={SOFT_DEPOSIT_LIMIT_EXCEEDED_WORD}
            />
            <button className={classes.cancelButton} onClick={onCancel} type="button">
              Cancel
            </button>
          </Card>
        ) : (
          <Card className={classes.card}>
            <h1 className={classes.title}>Warning</h1>
            <p className={classes.forbiddenText}>
              For safety reasons we don&apos;t allow to deposit large quantities of tokens into the
              zkEVM by the moment. Please, try again with an amount smaller than{" "}
              <b>
                {data.hardLimit} {data.formData.token.symbol}
              </b>
              .
            </p>
            <Button onClick={onCancel}>Close</Button>
          </Card>
        )}
      </div>
    </Portal>
  );
};
