import { BigNumber, constants as ethersConstants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useState } from "react";

import useAmountInputStyles from "src/views/home/components/amount-input/amount-input.styles";
import Typography from "src/views/shared/typography/typography.view";
import { Token } from "src/domain";

interface onChangeParams {
  amount?: BigNumber;
  error?: string;
}

interface AmountInputProps {
  value?: BigNumber;
  token: Token;
  balance: BigNumber;
  fee: BigNumber;
  onChange: (params: onChangeParams) => void;
}

const getFixedTokenAmount = (amount: string, decimals: number): string => {
  const amountWithDecimals = Number(amount) / Math.pow(10, decimals);
  return Number(amountWithDecimals.toFixed(decimals)).toString();
};

const AmountInput: FC<AmountInputProps> = ({ value, token, balance, fee, onChange }) => {
  const defaultInputValue = value ? getFixedTokenAmount(value.toString(), token.decimals) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const classes = useAmountInputStyles(inputValue.length);
  const actualFee = token.address === ethersConstants.AddressZero ? fee : BigNumber.from(0);

  const updateAmountInput = (amount?: BigNumber) => {
    if (amount) {
      const newAmountWithFee = amount.add(actualFee);
      const isNewAmountWithFeeMoreThanFunds = newAmountWithFee.gt(BigNumber.from(balance));
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
    const maxPossibleAmount = BigNumber.from(balance);
    const maxAmountWithoutFee = maxPossibleAmount.sub(actualFee);
    const newValue = getFixedTokenAmount(maxAmountWithoutFee.toString(), token.decimals);

    setInputValue(newValue);
    updateAmountInput(maxAmountWithoutFee);
  };

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
        onChange={handleInputChange}
      />
    </div>
  );
};

export default AmountInput;
