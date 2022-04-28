import { BigNumber, constants as ethersConstants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

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
  fee?: BigNumber;
  onChange: (params: onChangeParams) => void;
}

const AmountInput: FC<AmountInputProps> = ({ value, token, balance, fee, onChange }) => {
  const defaultInputValue = value ? formatUnits(value, token.decimals) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [actualFee, setActualFee] = useState<BigNumber>();
  const classes = useAmountInputStyles(inputValue.length);

  const updateAmountInput = useCallback(
    (amount?: BigNumber) => {
      if (amount) {
        if (actualFee) {
          const newAmountWithFee = amount.add(actualFee);
          const isNewAmountWithFeeMoreThanFunds = newAmountWithFee.gt(balance);
          const error = isNewAmountWithFeeMoreThanFunds ? "Insufficient balance" : undefined;

          return onChange({ amount, error });
        } else {
          return onChange({ amount, error: "Insufficient balance" });
        }
      }
    },
    [actualFee, balance, onChange]
  );

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
    if (actualFee) {
      const maxAmountWithoutFee = balance.sub(actualFee);

      if (maxAmountWithoutFee.gt(0)) {
        const newValue = formatUnits(maxAmountWithoutFee, token.decimals);

        setInputValue(newValue);
        updateAmountInput(maxAmountWithoutFee);
      }
    }
  };

  useEffect(() => {
    // TODO Find a way to react to this event without checking undefined
    if (value === undefined) {
      setInputValue("");
      updateAmountInput();
    }
  }, [value, updateAmountInput]);

  useEffect(() => {
    if (fee !== undefined) {
      if (token.address === ethersConstants.AddressZero) {
        setActualFee(fee);
      } else {
        setActualFee(BigNumber.from(0));
      }
    }
  }, [fee, token]);

  return (
    <div className={classes.wrapper}>
      <button
        className={classes.maxButton}
        type="button"
        disabled={fee === undefined}
        onClick={handleSendAll}
      >
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
