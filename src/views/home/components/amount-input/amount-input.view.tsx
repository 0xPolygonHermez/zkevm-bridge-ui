import { BigNumber, constants as ethersConstants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useEffect, useState } from "react";

import useAmountInputStyles from "src/views/home/components/amount-input/amount-input.styles";
import Typography from "src/views/shared/typography/typography.view";
import { Token } from "src/domain";

interface onChangeParams {
  amount?: BigNumber;
  error?: string;
}

interface AmountInputProps {
  value: BigNumber;
  token: Token;
  balance: BigNumber;
  fee: BigNumber;
  onChange: (params: onChangeParams) => void;
}

const AmountInput: FC<AmountInputProps> = ({ value, token, balance, fee, onChange }) => {
  const defaultInputValue = value && !value.isZero() ? formatUnits(value, token.decimals) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const classes = useAmountInputStyles(inputValue.length);
  const actualFee = token.address === ethersConstants.AddressZero ? fee : BigNumber.from(0);

  const updateAmountInput = (amount?: BigNumber) => {
    if (amount) {
      const newAmountWithFee = amount.add(actualFee);
      const isNewAmountWithFeeMoreThanFunds = newAmountWithFee.gt(balance);
      const error = isNewAmountWithFeeMoreThanFunds ? "Insufficient balance" : undefined;
      onChange({ amount, error });
    } else {
      onChange({});
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d|\\.)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);
    const isInputValid = INPUT_REGEX.test(value);

    const newAmountInTokens =
      value.length > 0 && isInputValid ? parseUnits(value, token.decimals) : undefined;

    if (isInputValid) {
      updateAmountInput(newAmountInTokens);
      setInputValue(value);
    }
  };

  const handleSendAll = () => {
    const maxPossibleAmount = balance;
    const maxAmountWithoutFee = maxPossibleAmount.sub(actualFee);

    if (maxAmountWithoutFee.gt(0)) {
      const newValue = formatUnits(maxAmountWithoutFee, token.decimals);

      setInputValue(newValue);
      updateAmountInput(maxAmountWithoutFee);
    }
  };

  useEffect(() => {
    if (inputValue.length > 0) {
      updateAmountInput(parseUnits(inputValue, token.decimals));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <div className={classes.wrapper}>
      <button className={classes.maxButton} type="button" onClick={handleSendAll}>
        <Typography type="body2" className={classes.maxText}>
          MAX
        </Typography>
      </button>
      <input
        className={classes.amountInput}
        value={inputValue}
        placeholder="0.00"
        autoFocus
        onChange={handleInputChange}
      />
    </div>
  );
};

export default AmountInput;
