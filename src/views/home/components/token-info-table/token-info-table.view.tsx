import { constants as ethersConstants } from "ethers";
import { FC } from "react";

import { ReactComponent as CopyIcon } from "src/assets/icons/copy.svg";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { useEnvContext } from "src/contexts/env.context";
import { Token } from "src/domain";
import { getShortenedEthereumAddress } from "src/utils/addresses";
import { copyToClipboard } from "src/utils/browser";
import { isTokenEther } from "src/utils/tokens";
import { useTokenInfoTableStyles } from "src/views/home/components/token-info-table/token-info-table.styles";
import { Typography } from "src/views/shared/typography/typography.view";

interface TokenInfoTableProps {
  className?: string;
  token: Token;
}

export const TokenInfoTable: FC<TokenInfoTableProps> = ({ className, token }) => {
  const classes = useTokenInfoTableStyles();
  const env = useEnvContext();

  if (!env) {
    return null;
  }

  const nameRow = (
    <div className={classes.row}>
      <Typography className={classes.alignRow} type="body2">
        Token name
      </Typography>
      <Typography className={classes.alignRow} type="body1">
        {token.name}
      </Typography>
    </div>
  );

  const symbolRow = (
    <div className={classes.row}>
      <Typography className={classes.alignRow} type="body2">
        Token symbol
      </Typography>
      <Typography className={classes.alignRow} type="body1">
        {token.symbol}
      </Typography>
    </div>
  );

  const decimalsRow = (
    <div className={classes.row}>
      <Typography className={classes.alignRow} type="body2">
        Token decimals
      </Typography>
      <Typography className={classes.alignRow} type="body1">
        {token.decimals}
      </Typography>
    </div>
  );

  if (isTokenEther(token)) {
    const ethereum = env.chains[0];
    const polygonZkEVM = env.chains[1];

    const ethereumRow = (
      <div className={classes.row}>
        <Typography className={classes.alignRow} type="body2">
          <ethereum.Icon className={classes.chainIcon} />
          L1 token address
        </Typography>
        <Typography className={classes.alignRow} type="body1">
          {getShortenedEthereumAddress(ethersConstants.AddressZero)}
        </Typography>
      </div>
    );

    const polygonZkEVMRow = (
      <div className={classes.row}>
        <Typography className={classes.alignRow} type="body2">
          <polygonZkEVM.Icon className={classes.chainIcon} />
          L2 token address
        </Typography>
        <Typography className={classes.alignRow} type="body1">
          {getShortenedEthereumAddress(ethersConstants.AddressZero)}
        </Typography>
      </div>
    );

    return (
      <div className={`${classes.wrapper} ${className || ""}`}>
        {ethereumRow}
        {polygonZkEVMRow}
        {nameRow}
        {symbolRow}
        {decimalsRow}
      </div>
    );
  } else {
    const nativeTokenChain = env.chains.find(({ chainId }) => chainId === token.chainId);
    const nativeTokenAddress = token.address;

    const wrappedTokenChainId = token.wrappedToken?.chainId;
    const wrappedTokenAddress = token.wrappedToken?.address;

    const wrappedTokenChain =
      wrappedTokenChainId !== undefined
        ? env.chains.find(({ chainId }) => chainId === wrappedTokenChainId)
        : undefined;

    const nativeAddressRow = nativeTokenChain ? (
      <div className={classes.row}>
        <Typography className={classes.alignRow} type="body2">
          <nativeTokenChain.Icon className={classes.chainIcon} />
          {`${nativeTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
        </Typography>
        <div className={classes.rowRightBlock}>
          <Typography className={classes.tokenAddress} type="body1">
            {getShortenedEthereumAddress(nativeTokenAddress)}
          </Typography>
          <button
            className={classes.button}
            onClick={() => {
              copyToClipboard(nativeTokenAddress);
            }}
          >
            <CopyIcon className={classes.copyIcon} />
          </button>
          <a
            className={classes.button}
            href={`${nativeTokenChain.explorerUrl}/address/${nativeTokenAddress}`}
            rel="noreferrer"
            target="_blank"
          >
            <NewWindowIcon className={classes.newWindowIcon} />
          </a>
        </div>
      </div>
    ) : null;

    const wrappedAddressRow =
      wrappedTokenChain && wrappedTokenAddress ? (
        <div className={classes.row}>
          <Typography className={classes.alignRow} type="body2">
            <wrappedTokenChain.Icon className={classes.chainIcon} />
            {`${wrappedTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
          </Typography>
          <div className={classes.rowRightBlock}>
            <Typography className={classes.tokenAddress} type="body1">
              {getShortenedEthereumAddress(wrappedTokenAddress)}
            </Typography>
            <button
              className={classes.button}
              onClick={() => {
                copyToClipboard(wrappedTokenAddress);
              }}
            >
              <CopyIcon className={classes.copyIcon} />
            </button>
            <a
              className={classes.button}
              href={`${wrappedTokenChain.explorerUrl}/address/${wrappedTokenAddress}`}
              rel="noreferrer"
              target="_blank"
            >
              <NewWindowIcon className={classes.newWindowIcon} />
            </a>
          </div>
        </div>
      ) : null;

    return (
      <div className={`${classes.wrapper} ${className || ""}`}>
        {nativeAddressRow}
        {wrappedAddressRow}
        {nameRow}
        {symbolRow}
        {decimalsRow}
      </div>
    );
  }
};
