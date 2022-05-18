import React, { FC } from "react";

import useListStyles from "src/views/home/components/chain-list/chain-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Portal from "src/views/shared/portal/portal.view";
import { Chain } from "src/domain";
import { getChainName } from "src/utils/labels";

interface ChainListProps {
  chains: Chain[];
  selected: Chain;
  onClick: (chain: Chain) => void;
  onClose: () => void;
}

const ChainList: FC<ChainListProps> = ({ chains, selected, onClick, onClose }) => {
  const classes = useListStyles();

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
          <div className={classes.list}>
            {chains.slice(0, 20).map((chain) => (
              <button
                className={classes.button}
                key={chain.key}
                disabled={chain.key === selected.key}
                onClick={() => onClick(chain)}
              >
                <chain.Icon className={classes.icon} />
                <Typography type="body1">{getChainName(chain)}</Typography>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default ChainList;
