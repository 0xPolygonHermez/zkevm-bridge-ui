import { FC } from "react";

import { ReactComponent as EthChainIcon } from "src/assets/icons/ethereum.svg";
import { ReactComponent as HermezChainIcon } from "src/assets/icons/polygon-hermez.svg";
import Typography from "src/views/shared/typography/typography.view";
import useChainRowStyles from "src/views/transaction-details/components/chain-row/chain-row.style";

interface ChainRowProps {
  type: "l1" | "l2";
  side: "to" | "from";
  className?: string;
}

const ChainRow: FC<ChainRowProps> = ({ type, side, className }) => {
  const classes = useChainRowStyles();

  const chain = {
    l1: { from: "hermez", to: "eth" },
    l2: { from: "eth", to: "hermez" },
  };

  switch (chain[type][side]) {
    case "eth":
      return (
        <Typography type="body1" className={className}>
          <EthChainIcon /> Ethereum chain
        </Typography>
      );
    case "hermez":
      return (
        <Typography type="body1" className={className}>
          <HermezChainIcon className={classes.hermezChain} /> Polygon Hermez chain
        </Typography>
      );
    default:
      return null;
  }
};

export default ChainRow;
