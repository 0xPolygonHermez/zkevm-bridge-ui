import { FC } from "react";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { Chain, Env } from "src/domain";
import useNetworkBoxStyles from "src/views/shared/network-box/network-box.styles";
import Typography from "src/views/shared/typography/typography.view";

interface NetworkBoxProps {
  changeNetwork: (chain: Chain) => Promise<number>;
  env: Env;
}

const NetworkBox: FC<NetworkBoxProps> = ({ env, changeNetwork }) => {
  const classes = useNetworkBoxStyles();

  return (
    <div className={classes.networkBox}>
      <div className={classes.title}>
        <Typography type="body1">Polygon zkEVM</Typography>
        <button
          className={classes.metaMaskButton}
          onClick={() => void changeNetwork(env.chains[1])}
        >
          <MetaMaskIcon className={classes.metaMaskIcon} />
          Add to MetaMask
        </button>
      </div>
      <ul>
        <li>
          <Typography type="body2">RPC URL: {env.chains[1].provider.connection.url}</Typography>
        </li>
        <li>
          <Typography type="body2">Chain ID: {env.chains[1].chainId}</Typography>
        </li>
        <li>
          <Typography type="body2">
            Currency symbol: {env.chains[1].nativeCurrency.symbol}
          </Typography>
        </li>
        <li>
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
      </ul>
      <Typography type="body1">Network smart contract</Typography>
      <Typography type="body2">
        <a
          href={`${env.chains[0].explorerUrl}/address/${env.chains[0].poeContractAddress}`}
          rel="noreferrer"
          target="_blank"
          className={classes.link}
        >
          {env.chains[0].poeContractAddress}
        </a>
      </Typography>
    </div>
  );
};

export default NetworkBox;
