import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { Token } from "src/domain";
import { formatTokenAmount } from "src/utils/amounts";
import { useAmountInputStyles } from "src/views/home/components/amount-input/amount-input.styles";
import { Typography } from "src/views/shared/typography/typography.view";

interface AmountInputProps {
  balance: BigNumber;
  onChange: (params: { amount?: BigNumber; error?: string }) => void;
  token: Token;
  value?: BigNumber;
}

export const AmountInput: FC<AmountInputProps> = ({ balance, onChange, token, value }) => {
  const defaultInputValue = value ? formatTokenAmount(value, token) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const classes = useAmountInputStyles(inputValue.length);

  const processOnChangeCallback = (amount?: BigNumber) => {
    if (amount) {
      const error = amount.gt(balance) ? "Insufficient balance" : undefined;

      return onChange({ amount, error });
    } else {
      return onChange({});
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d|\\.)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);
    const isInputValid = INPUT_REGEX.test(value);
    const amount = value.length > 0 && isInputValid ? parseUnits(value, token.decimals) : undefined;

    if (isInputValid) {
      setInputValue(value);
      processOnChangeCallback(amount);
    }
  };

  const onMax = () => {
    if (balance.gt(0)) {
      setInputValue(formatTokenAmount(balance, token));
      processOnChangeCallback(balance);
    } else {
      setInputValue("");
      processOnChangeCallback();
    }
  };

  useEffect(() => {
    // Reset the input when the chain or the token are changed
    if (value === undefined) {
      setInputValue("");
    }
  }, [value]);

  return (
    <div className={classes.wrapper}>
      <button className={classes.maxButton} onClick={onMax} type="button">
        <Typography className={classes.maxText} type="body2">
          MAX
        </Typography>
      </button>
      <input
        autoFocus
        className={classes.amountInput}
        onChange={onInputChange}
        placeholder="0.00"
        value={inputValue}
      />
    </div>
  );
};
