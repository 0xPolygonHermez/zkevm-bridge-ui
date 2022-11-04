import { FC } from "react";
import { BigNumber } from "ethers";

import { Token } from "src/domain";
import { formatTokenAmount } from "src/utils/amounts";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import Spinner from "src/views/shared/spinner/spinner.view";
import Typography, { TypographyProps } from "src/views/shared/typography/typography.view";
import useTokenBalanceStyles from "src/views/shared/token-balance/token-balance.styles";

interface TokenBalanceProps {
  spinnerSize: number;
  token: Token;
  typographyProps: TypographyProps;
}

const TokenBalance: FC<TokenBalanceProps> = ({ spinnerSize, token, typographyProps }) => {
  const classes = useTokenBalanceStyles();
  const loader = (
    <div className={classes.loader}>
      <Spinner size={spinnerSize} />
      <Typography {...typographyProps}>&nbsp;{token.symbol}</Typography>
    </div>
  );

  if (!token.balance) {
    return loader;
  }

  switch (token.balance.status) {
    case "pending":
    case "loading":
    case "reloading": {
      return loader;
    }
    case "successful":
    case "failed": {
      const formattedTokenAmount = formatTokenAmount(
        isAsyncTaskDataAvailable(token.balance) ? token.balance.data : BigNumber.from(0),
        token
      );

      return (
        <Typography {...typographyProps}>{`${formattedTokenAmount} ${token.symbol}`}</Typography>
      );
    }
  }
};

export default TokenBalance;
