import { FC, useState, useEffect } from "react";

import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useNetworkSelectorStyles from "src/views/shared/network-selector/network-selector.styles";
import Typography from "src/views/shared/typography/typography.view";
import ChainList from "src/views/shared/chain-list/chain-list.view";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useErrorContext } from "src/contexts/error.context";
import { Chain } from "src/domain";
import { isMetaMaskUserRejectedRequestError } from "src/utils/types";
import useCallIfMounted from "src/hooks/use-call-if-mounted";

const NetworkSelector: FC = () => {
  const classes = useNetworkSelectorStyles();
  const env = useEnvContext();
  const { connectedProvider, changeNetwork } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const callIfMounted = useCallIfMounted();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<Chain>();

  useEffect(() => {
    if (env && connectedProvider) {
      const selectedChain = env.chains.find((chain) => chain.chainId === connectedProvider.chainId);
      if (selectedChain) {
        setSelectedChain(selectedChain);
      }
    }
  }, [connectedProvider, env]);

  if (!env || !selectedChain) {
    return null;
  }

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
          chains={env.chains}
          onClick={(chain) => {
            changeNetwork(chain).catch((error) => {
              callIfMounted(() => {
                if (isMetaMaskUserRejectedRequestError(error) === false) {
                  notifyError(error);
                }
              });
            });
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
