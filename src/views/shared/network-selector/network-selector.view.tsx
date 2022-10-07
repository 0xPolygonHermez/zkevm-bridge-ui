import { FC, useState } from "react";

import useNetworkSelectorStyles from "src/views/shared/network-selector/network-selector.styles";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import Typography from "src/views/shared/typography/typography.view";
import ChainList from "src/views/shared/chain-list/chain-list.view";
import { Chain } from "src/domain";

interface NetworkSelectorProps {
  chains: Chain[];
  selectedChain: Chain;
  onSelect: (chain: Chain) => void;
}

const NetworkSelector: FC<NetworkSelectorProps> = ({ chains, selectedChain, onSelect }) => {
  const classes = useNetworkSelectorStyles();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        title={selectedChain.name}
        className={classes.networkButton}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <selectedChain.Icon />
        <Typography type="body1" className={classes.networkButtonText}>
          {selectedChain.name}
        </Typography>
        <CaretDown />
      </button>
      {isOpen && (
        <ChainList
          chains={chains}
          onClick={(chain) => {
            onSelect(chain);
            setIsOpen(false);
          }}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};

export default NetworkSelector;
