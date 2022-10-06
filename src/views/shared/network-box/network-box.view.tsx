import { FC, useState } from "react";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useEnvContext } from "src/contexts/env.context";
import { Chain } from "src/domain";
import Card from "src/views/shared/card/card.view";
import useNetworkBoxStyles from "src/views/shared/network-box/network-box.styles";
import Typography from "src/views/shared/typography/typography.view";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";

interface NetworkBoxProps {
  onChangeNetwork: (chain: Chain) => void;
}

const NetworkBox: FC<NetworkBoxProps> = ({ onChangeNetwork }) => {
  const classes = useNetworkBoxStyles();
  const env = useEnvContext();
  const [isOpen, setIsOpen] = useState(true);

  if (!env) {
    return null;
  }

  return (
    <Card>
      <div className={classes.networkBox}>
        <div className={classes.header}>
          <div />
          <Typography type="body1">Polygon zkEVM network</Typography>
          <button className={classes.actionButton} onClick={() => setIsOpen(!isOpen)}>
            <CaretDown className={!isOpen ? classes.caretUp : ""} />
          </button>
        </div>
        {isOpen && (
          <>
            <ul>
              <li className={classes.listItem}>
                <Typography type="body2">
                  RPC URL: {env.chains[1].provider.connection.url}
                </Typography>
              </li>
              <li className={classes.listItem}>
                <Typography type="body2">Chain ID: {env.chains[1].chainId}</Typography>
              </li>
              <li className={classes.listItem}>
                <Typography type="body2">
                  Currency symbol: {env.chains[1].nativeCurrency.symbol}
                </Typography>
              </li>
              <li className={classes.listItem}>
                <Typography type="body2">
                  Block explorer URL:{" "}
                  <a
                    href={env.chains[1].explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
                    {env.chains[1].explorerUrl}
                  </a>
                </Typography>
              </li>
              <li className={classes.listItem}>
                <Typography type="body2">
                  PoE Smart Contract:{" "}
                  <a
                    href={`${env.chains[0].explorerUrl}/address/${env.chains[0].poeContractAddress}`}
                    rel="noreferrer"
                    target="_blank"
                    className={classes.link}
                  >
                    {env.chains[0].poeContractAddress}
                  </a>
                </Typography>
              </li>
            </ul>
            <button
              className={classes.metaMaskButton}
              onClick={() => void onChangeNetwork(env.chains[1])}
            >
              <MetaMaskIcon className={classes.metaMaskIcon} />
              Add to MetaMask
            </button>
          </>
        )}
      </div>
    </Card>
  );
};

export default NetworkBox;
