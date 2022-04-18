import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useState } from "react";

import useAmountInputStyles from "src/views/home/components/amount-input/amount-input.styles";
import Typography from "src/views/shared/typography/typography.view";
import { Token } from "src/domain";

interface onChangeParams {
  amount: BigNumber;
  isInvalid: boolean;
}

interface AmountInputProps {
  token: Token;
  balance: BigNumber;
  fee: BigNumber;
  onChange: (params: onChangeParams) => void;
}

const AmountInput: FC<AmountInputProps> = ({ token, balance, fee, onChange }) => {
  const [value, setValue] = useState("");
  const classes = useAmountInputStyles(value.length);
  const actualFee = token.symbol === "WETH" ? fee : BigNumber.from(0);

  const getFixedTokenAmount = (amount: string, decimals: number): string => {
    const amountWithDecimals = Number(amount) / Math.pow(10, decimals);
    return Number(amountWithDecimals.toFixed(decimals)).toString();
  };

  const updateAmountInput = (amount: BigNumber) => {
    const newAmountWithFee = amount.add(actualFee);
    const isNewAmountWithFeeMoreThanFunds = newAmountWithFee.gt(BigNumber.from(balance));
    const isAmountInvalid = isNewAmountWithFeeMoreThanFunds || amount.isZero();

    onChange({
      amount,
      isInvalid: isAmountInvalid,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d|\\.)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);

    if (INPUT_REGEX.test(event.target.value)) {
      const tokensValue = event.target.value.length > 0 ? event.target.value : "0";
      const newAmountInTokens = parseUnits(tokensValue, token.decimals);

      setValue(event.target.value);
      updateAmountInput(newAmountInTokens);
    }
  };

  const handleSendAll = () => {
    const maxPossibleAmount = BigNumber.from(balance);
    const maxAmountWithoutFee = maxPossibleAmount.sub(actualFee);
    const newValue = getFixedTokenAmount(maxAmountWithoutFee.toString(), token.decimals);

    setValue(newValue);
    updateAmountInput(maxAmountWithoutFee);
  };

  return (
    <div className={classes.wrapper}>
      <button className={classes.maxButton} type="button" onClick={handleSendAll}>
        <Typography type="body2">MAX</Typography>
      </button>
      <input
        className={classes.amountInput}
        value={value}
        placeholder="0.00"
        autoFocus
        onChange={handleInputChange}
      />
    </div>
  );
};

export default AmountInput;
