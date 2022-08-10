import { constants as ethersConstants } from "ethers";
import { FC, useEffect, useState } from "react";
import { parseError } from "src/adapters/error";

import { approve, isContractAllowedToSpendToken } from "src/adapters/ethereum";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Chain, Token } from "src/domain";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";

import Button from "src/views/shared/button/button.view";

interface BridgeButtonProps {
  from: Chain;
  token: Token;
  account: string;
  onBridge: () => void;
}

const BridgeButton: FC<BridgeButtonProps> = ({ from, token, account, onBridge }) => {
  const { connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const [hasAllowanceTask, setHasAllowanceTask] = useState<AsyncTask<boolean, string>>({
    status: "pending",
  });
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });

  useEffect(() => {
    if (token.address !== ethersConstants.AddressZero) {
      setHasAllowanceTask({ status: "loading" });
      void isContractAllowedToSpendToken({
        provider: from.provider,
        token,
        owner: account,
        spender: from.contractAddress,
      })
        .then((isAllowed) => setHasAllowanceTask({ status: "successful", data: isAllowed }))
        .catch((error) => {
          void parseError(error).then((parsed) => {
            setHasAllowanceTask({ status: "failed", error: parsed });
            notifyError(parsed);
          });
        });
    }
  }, [from, token, account, notifyError]);

  const onApprove = () => {
    setApprovalTask({ status: "loading" });
    if (connectedProvider) {
      void approve({
        token,
        owner: account,
        spender: from.contractAddress,
        provider: connectedProvider.provider,
      })
        .then(() => setApprovalTask({ status: "successful", data: null }))
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error)) {
            setApprovalTask({ status: "pending" });
          } else {
            void parseError(error).then((parsed) => {
              setApprovalTask({ status: "failed", error: parsed });
              notifyError(parsed);
            });
          }
        });
    }
  };

  const bridgeButton = <Button onClick={onBridge}>Bridge</Button>;

  if (token.address === ethersConstants.AddressZero) {
    return bridgeButton;
  } else {
    switch (hasAllowanceTask.status) {
      case "pending":
      case "loading":
      case "reloading": {
        return <Button isLoading />;
      }
      case "failed": {
        return <Button disabled={true}>Bridge</Button>;
      }
      case "successful": {
        if (hasAllowanceTask.data) {
          return bridgeButton;
        }

        switch (approvalTask.status) {
          case "pending": {
            return (
              <Button onClick={onApprove}>
                {`Allow Polygon zkEVM Bridge to spend my ${token.symbol}`}
              </Button>
            );
          }
          case "loading":
          case "reloading": {
            return <Button isLoading>Waiting for approval</Button>;
          }
          case "failed": {
            return <Button disabled={true}>Bridge</Button>;
          }
          case "successful": {
            return bridgeButton;
          }
        }
      }
    }
  }
};

export default BridgeButton;
