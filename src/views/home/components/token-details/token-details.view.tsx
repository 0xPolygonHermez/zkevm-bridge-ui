import { FC } from "react";
import { constants as ethersConstants } from "ethers";

import useTokenDetailsStyles from "src/views/home/components/token-details/token-details.styles";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { Token } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";

interface TokenDetailsProps {
  token: Token;
  className?: string;
}

const TokenDetails: FC<TokenDetailsProps> = ({ token, className }) => {
  const classes = useTokenDetailsStyles();

  const env = useEnvContext();
  if (!env) {
    return null;
  }

  const nameRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token name
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.name}
      </Typography>
    </div>
  );

  const symbolRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token symbol
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.symbol}
      </Typography>
    </div>
  );

  const decimalsRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token decimals
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.decimals}
      </Typography>
    </div>
  );

  if (token.address === ethersConstants.AddressZero) {
    const ethereum = env.chains[0];
    const polygonZkEVM = env.chains[1];

    const ethereumRow = (
      <div className={classes.row}>
        <Typography type="body2" className={classes.alignRow}>
          <ethereum.Icon />
          L1 token address
        </Typography>
        <Typography type="body1" className={classes.alignRow}>
          {getPartiallyHiddenEthereumAddress(ethersConstants.AddressZero)}
        </Typography>
      </div>
    );

    const polygonZkEVMRow = (
      <div className={classes.row}>
        <Typography type="body2" className={classes.alignRow}>
          <polygonZkEVM.Icon />
          L2 token address
        </Typography>
        <Typography type="body1" className={classes.alignRow}>
          {getPartiallyHiddenEthereumAddress(ethersConstants.AddressZero)}
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
        <Typography type="body2" className={classes.alignRow}>
          <nativeTokenChain.Icon />
          {`${nativeTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
        </Typography>
        <Typography type="body1" className={classes.alignRow}>
          {getPartiallyHiddenEthereumAddress(nativeTokenAddress)}
        </Typography>
      </div>
    ) : null;

    const wrappedAddressRow =
      wrappedTokenChain && wrappedTokenAddress ? (
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            <wrappedTokenChain.Icon />
            {`${wrappedTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {getPartiallyHiddenEthereumAddress(wrappedTokenAddress)}
          </Typography>
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

export default TokenDetails;
