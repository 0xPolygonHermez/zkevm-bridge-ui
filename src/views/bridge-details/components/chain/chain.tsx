import { FC } from "react";

import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonZkEVMChainIcon } from "src/assets/icons/chains/polygon-zkevm.svg";
import * as domain from "src/domain";
import { useChainStyles } from "src/views/bridge-details/components/chain/chain.styles";
import { Typography } from "src/views/shared/typography/typography.view";

interface ChainProps {
  chain: domain.Chain;
  className?: string;
}

export const Chain: FC<ChainProps> = ({ chain, className }) => {
  const classes = useChainStyles();

  if (chain.key === "ethereum") {
    return (
      <Typography className={className} type="body1">
        <EthChainIcon /> {chain.name}
      </Typography>
    );
  } else {
    return (
      <Typography className={className} type="body1">
        <PolygonZkEVMChainIcon className={classes.polygonZkEvmChain} /> {chain.name}
      </Typography>
    );
  }
};
