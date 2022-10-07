import { FC } from "react";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Chain } from "src/domain";
import Card from "src/views/shared/card/card.view";
import useNetworkBoxStyles from "src/views/shared/network-box/network-box.styles";
import Typography from "src/views/shared/typography/typography.view";

interface NetworkBoxProps {
  onChangeNetwork: (chain: Chain) => void;
}

const NetworkBox: FC<NetworkBoxProps> = ({ onChangeNetwork }) => {
  const classes = useNetworkBoxStyles();
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();

  if (!env) {
    return null;
  }

  return (
    <Card>
      <div className={classes.networkBox}>
        <Typography type="body1">Polygon zkEVM network</Typography>
        <ul>
          <li className={classes.listItem}>
            <Typography type="body2">RPC URL: {env.chains[1].provider.connection.url}</Typography>
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
          disabled={connectedProvider?.chainId === env.chains[1].chainId}
          onClick={() => void onChangeNetwork(env.chains[1])}
        >
          <MetaMaskIcon className={classes.metaMaskIcon} />
          Add to MetaMask
        </button>
      </div>
    </Card>
  );
};

export default NetworkBox;
