import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useEffect, useState } from "react";

import useAmountInputStyles from "src/views/home/components/amount-input/amount-input.styles";
import Typography from "src/views/shared/typography/typography.view";
import { Chain, Token } from "src/domain";
import { formatTokenAmount } from "src/utils/amounts";

interface AmountInputProps {
  value?: BigNumber;
  token: Token;
  balance: BigNumber;
  from: Chain;
  maxEtherBridge: BigNumber;
  onChange: (params: { amount?: BigNumber; error?: string }) => void;
}

const AmountInput: FC<AmountInputProps> = ({
  value,
  token,
  balance,
  from,
  maxEtherBridge,
  onChange,
}) => {
  const defaultInputValue = value ? formatTokenAmount(value, token) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const classes = useAmountInputStyles(inputValue.length);
  const shouldApplyMaxEtherBridgeLimit =
    token.address === ethers.constants.AddressZero && from.key === "ethereum";

  const processOnChangeCallback = (amount?: BigNumber) => {
    if (amount) {
      const balanceError = amount.gt(balance) ? "Insufficient balance" : undefined;
      const maxEtherBridgeError =
        shouldApplyMaxEtherBridgeLimit && amount.gt(maxEtherBridge)
          ? "Amount exceeds the max allowed to bridge"
          : undefined;
      const error = balanceError || maxEtherBridgeError;

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
    const maxPossibleAmount =
      shouldApplyMaxEtherBridgeLimit && balance.gt(maxEtherBridge) ? maxEtherBridge : balance;
    if (maxPossibleAmount.gt(0)) {
      setInputValue(formatTokenAmount(maxPossibleAmount, token));
      processOnChangeCallback(maxPossibleAmount);
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
      <button className={classes.maxButton} type="button" onClick={onMax}>
        <Typography type="body2" className={classes.maxText}>
          MAX
        </Typography>
      </button>
      <input
        className={classes.amountInput}
        value={inputValue}
        placeholder="0.00"
        autoFocus
        onChange={onInputChange}
      />
    </div>
  );
};

export default AmountInput;
