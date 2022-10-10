import { FC } from "react";

import { ReactComponent as EthChainIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as PolygonZkEVMChainIcon } from "src/assets/icons/chains/polygon-zkevm.svg";
import Typography from "src/views/shared/typography/typography.view";
import useChainStyles from "src/views/bridge-details/components/chain/chain.styles";
import * as domain from "src/domain";

interface ChainProps {
  chain: domain.Chain;
  className?: string;
}

const Chain: FC<ChainProps> = ({ chain, className }) => {
  const classes = useChainStyles();

  if (chain.key === "ethereum") {
    return (
      <Typography type="body1" className={className}>
        <EthChainIcon />{" "}
        {domain.EthereumChainId.GOERLI === chain.chainId ? "Ethereum Goerli" : "Ethereum"}
      </Typography>
    );
  } else {
    return (
      <Typography type="body1" className={className}>
        <PolygonZkEVMChainIcon className={classes.polygonZkEvmChain} /> Polygon zkEVM
      </Typography>
    );
  }
};

export default Chain;
