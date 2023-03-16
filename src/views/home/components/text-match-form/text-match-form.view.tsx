import { FC, useState } from "react";

import { useTextMatchFormStyles } from "src/views/home/components/text-match-form/text-match-form.styles";
import { Button } from "src/views/shared/button/button.view";

interface TextMatchFormProps {
  onSubmit: () => void;
  text: string;
}

export const TextMatchForm: FC<TextMatchFormProps> = ({ onSubmit, text }) => {
  const classes = useTextMatchFormStyles();
  const [inputValue, setInputValue] = useState("");

  const doTextsMatch = () => text.toLowerCase() === inputValue.toLowerCase();

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <input
        autoFocus
        className={classes.input}
        onChange={(event) => setInputValue(event.target.value)}
        type="text"
        value={inputValue}
      />
      <Button disabled={!doTextsMatch()} type="submit">
        Continue
      </Button>
    </form>
  );
};
