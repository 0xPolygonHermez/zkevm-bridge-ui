import { FC, useState } from "react";

import { useTextMatchFormStyles } from "src/views/home/components/text-match-form/text-match-form.styles";
import { Button } from "src/views/shared/button/button.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface TextMatchFormProps {
  onSubmit: (hideDepositWarning: boolean) => void;
  text: string;
}

export const TextMatchForm: FC<TextMatchFormProps> = ({ onSubmit, text }) => {
  const classes = useTextMatchFormStyles();
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <form
      className={classes.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(isCheckboxChecked);
      }}
    >
      <input
        autoFocus
        className={classes.input}
        onChange={(event) => setInputValue(event.target.value)}
        type="text"
        value={inputValue}
      />
      <div className={classes.checkboxWrapper}>
        <input
          checked={isCheckboxChecked}
          className={classes.checkbox}
          id="hideDepositWarning"
          onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
          type="checkbox"
        />
        <label className={classes.checkboxLabel} htmlFor="hideDepositWarning">
          <Typography type="body1">Don&apos;t show this message again</Typography>
        </label>
      </div>
      <Button disabled={text.toLowerCase() !== inputValue.toLowerCase()} type="submit">
        Continue
      </Button>
    </form>
  );
};
