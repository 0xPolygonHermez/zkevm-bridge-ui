import { FC } from "react";

import { ReactComponent as EthChainIcon } from "src/assets/icons/ethereum.svg";
import { ReactComponent as HermezChainIcon } from "src/assets/icons/polygon-hermez.svg";
import Typography from "src/views/shared/typography/typography.view";
import useChainStyles from "src/views/transaction-details/components/chain/chain.styles";

interface ChainProps {
  chain: "ethereum" | "polygon";
  className?: string;
}

const Chain: FC<ChainProps> = ({ chain, className }) => {
  const classes = useChainStyles();

  if (chain === "ethereum") {
    return (
      <Typography type="body1" className={className}>
        <EthChainIcon /> Ethereum chain
      </Typography>
    );
  } else {
    return (
      <Typography type="body1" className={className}>
        <HermezChainIcon className={classes.hermezChain} /> Polygon Hermez chain
      </Typography>
    );
  }
};

export default Chain;
