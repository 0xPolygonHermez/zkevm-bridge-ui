import { FC } from "react";

import { ReactComponent as EthChainIcon } from "src/assets/icons/ethereum.svg";
import { ReactComponent as HermezChainIcon } from "src/assets/icons/polygon-hermez.svg";
import useChainRowStyles from "src/views/transaction-details/components/chain-row/chain-row.style";

interface ChainRowProps {
  type: "l1" | "l2";
  side: "to" | "from";
}

const ChainRow: FC<ChainRowProps> = ({ type, side }) => {
  const classes = useChainRowStyles();

  const chain = {
    l1: { from: "hermez", to: "eth" },
    l2: { from: "eth", to: "hermez" },
  };

  switch (chain[type][side]) {
    case "eth":
      return (
        <>
          <EthChainIcon /> Ethereum chain
        </>
      );
    case "hermez":
      return (
        <>
          <HermezChainIcon className={classes.hermezChain} /> Polygon Hermez chain
        </>
      );
    default:
      return null;
  }
};

export default ChainRow;
