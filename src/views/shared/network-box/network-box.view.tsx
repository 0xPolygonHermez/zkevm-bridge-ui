import { FC, useState } from "react";

import { parseError } from "src/adapters/error";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { POLYGON_SUPPORT_URL } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { Message } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { Card } from "src/views/shared/card/card.view";
import { ExternalLink } from "src/views/shared/external-link/external-link.view";
import { useNetworkBoxStyles } from "src/views/shared/network-box/network-box.styles";
import { Typography } from "src/views/shared/typography/typography.view";

export const NetworkBox: FC = () => {
  const classes = useNetworkBoxStyles();
  const env = useEnvContext();
  const { addNetwork, connectedProvider } = useProvidersContext();
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
    text: `${polygonZkEVMChain.name} network successfully added`,
    type: "success-msg",
  };

  const onAddNetwork = (): void => {
    setIsAddNetworkButtonDisabled(true);
    addNetwork(polygonZkEVMChain)
      .then(() => {
        callIfMounted(() => {
          openSnackbar(successMsg);
        });
      })
      .catch((error) => {
        callIfMounted(() => {
          void parseError(error).then((parsed) => {
            if (parsed === "wrong-network") {
              openSnackbar(successMsg);
            } else if (isMetaMaskUserRejectedRequestError(error) === false) {
              notifyError(error);
            }
          });
        });
      })
      .finally(() => {
        callIfMounted(() => {
          setIsAddNetworkButtonDisabled(false);
        });
      });
  };

  return (
    <Card>
      <div className={classes.networkBox}>
        <Typography type="body1">{env.chains[1].name}</Typography>
        <ul className={classes.list}>
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
              <ExternalLink href={polygonZkEVMChain.explorerUrl}>
                {polygonZkEVMChain.explorerUrl}
              </ExternalLink>
            </Typography>
          </li>
          <li className={classes.listItem}>
            <Typography type="body2">
              {env.chains[0].name} Smart Contract:{" "}
              <ExternalLink
                href={`${ethereumChain.explorerUrl}/address/${ethereumChain.poeContractAddress}`}
              >
                {ethereumChain.poeContractAddress}
              </ExternalLink>
            </Typography>
          </li>
        </ul>
        <div className={classes.buttons}>
          <button
            className={classes.button}
            disabled={
              isAddNetworkButtonDisabled ||
              (isAsyncTaskDataAvailable(connectedProvider) &&
                connectedProvider.data.chainId === polygonZkEVMChain.chainId)
            }
            onClick={onAddNetwork}
          >
            <MetaMaskIcon className={classes.buttonIcon} />
            Add to MetaMask
          </button>
          <a
            className={classes.button}
            href={POLYGON_SUPPORT_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <NewWindowIcon className={classes.buttonIcon} />
            Report an issue
          </a>
        </div>
      </div>
    </Card>
  );
};
