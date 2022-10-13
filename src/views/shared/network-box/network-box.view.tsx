import { FC, useState } from "react";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { useErrorContext } from "src/contexts/error.context";
import Card from "src/views/shared/card/card.view";
import useNetworkBoxStyles from "src/views/shared/network-box/network-box.styles";
import Typography from "src/views/shared/typography/typography.view";
import { isMetaMaskUserRejectedRequestError } from "src/utils/types";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { parseError } from "src/adapters/error";
import { Message } from "src/domain";

const NetworkBox: FC = () => {
  const classes = useNetworkBoxStyles();
  const env = useEnvContext();
  const { connectedProvider, addNetwork } = useProvidersContext();
  const [isAddNetworkButtonDisabled, setIsAddNetworkButtonDisabled] = useState(false);
  const { openSnackbar } = useUIContext();
  const callIfMounted = useCallIfMounted();
  const { notifyError } = useErrorContext();

  if (!env) {
    return null;
  }

  const ethereumChain = env.chains[0];
  const polygonZkEVMChain = env.chains[1];

  const successMsg: Message = {
    type: "success-msg",
    text: `${polygonZkEVMChain.name} network successfully added`,
  };

  const onAddNetwork = (): void => {
    setIsAddNetworkButtonDisabled(true);
    addNetwork(polygonZkEVMChain)
      .then(() => {
        setIsAddNetworkButtonDisabled(false);
        callIfMounted(() => {
          openSnackbar(successMsg);
        });
      })
      .catch((error) => {
        callIfMounted(() => {
          setIsAddNetworkButtonDisabled(false);
          void parseError(error).then((parsed) => {
            if (parsed === "wrong-network") {
              openSnackbar(successMsg);
            } else if (isMetaMaskUserRejectedRequestError(error) === false) {
              notifyError(error);
            }
          });
        });
      });
  };

  return (
    <Card>
      <div className={classes.networkBox}>
        <Typography type="body1">Polygon zkEVM testnet</Typography>
        <ul>
          <li className={classes.listItem}>
            <Typography type="body2">
              RPC URL: {polygonZkEVMChain.provider.connection.url}
            </Typography>
          </li>
          <li className={classes.listItem}>
            <Typography type="body2">Chain ID: {polygonZkEVMChain.chainId}</Typography>
          </li>
          <li className={classes.listItem}>
            <Typography type="body2">
              Currency symbol: {polygonZkEVMChain.nativeCurrency.symbol}
            </Typography>
          </li>
          <li className={classes.listItem}>
            <Typography type="body2">
              Block explorer URL:{" "}
              <a
                href={polygonZkEVMChain.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className={classes.link}
              >
                {polygonZkEVMChain.explorerUrl}
              </a>
            </Typography>
          </li>
          <li className={classes.listItem}>
            <Typography type="body2">
              L1 Goerli Smart Contract:{" "}
              <a
                href={`${ethereumChain.explorerUrl}/address/${ethereumChain.poeContractAddress}`}
                rel="noreferrer"
                target="_blank"
                className={classes.link}
              >
                {ethereumChain.poeContractAddress}
              </a>
            </Typography>
          </li>
        </ul>
        <button
          className={classes.metaMaskButton}
          disabled={
            isAddNetworkButtonDisabled || connectedProvider?.chainId === polygonZkEVMChain.chainId
          }
          onClick={onAddNetwork}
        >
          <MetaMaskIcon className={classes.metaMaskIcon} />
          Add to MetaMask
        </button>
      </div>
    </Card>
  );
};

export default NetworkBox;
