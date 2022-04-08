import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useState } from "react";

import { Token } from "src/domain";

import useAmountInputtStyles from "src/views/home/components/amount-input/amount-input.styles";
import Typography from "src/views/shared/typography/typography.view";

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
  const classes = useAmountInputtStyles(value.length);
  const actualFee = token.symbol.includes("ETH") ? fee : BigNumber.from(0);

  const getFixedTokenAmount = (amount: string, decimals = 18): string => {
    const amountWithDecimals = Number(amount) / Math.pow(10, decimals);
    return Number(amountWithDecimals.toFixed(decimals)).toString();
  };
  const updateAmountInput = (amount: BigNumber) => {
    const newAmountWithFee = amount.add(actualFee);
    const isNewAmountWithFeeMoreThanFunds = newAmountWithFee.gt(BigNumber.from(balance));
    const areFundsExceededDueToFee =
      isNewAmountWithFeeMoreThanFunds && amount.lte(BigNumber.from(balance));
    const isAmountInvalid =
      isNewAmountWithFeeMoreThanFunds || areFundsExceededDueToFee || amount.isZero();

    onChange({
      amount,
      isInvalid: isAmountInvalid,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);
    if (event.target.value === "") {
      setValue(event.target.value);
      updateAmountInput(BigNumber.from(0));
    } else if (event.target.value === ".") {
      setValue("0.");
    } else if (INPUT_REGEX.test(event.target.value)) {
      const newAmountInTokens = parseUnits(event.target.value, token.decimals);

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
        <Typography type="body2" className={classes.maxText}>
          MAX
        </Typography>
      </button>
      <input
        className={classes.amountInput}
        value={value}
        placeholder="0.00"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default AmountInput;
