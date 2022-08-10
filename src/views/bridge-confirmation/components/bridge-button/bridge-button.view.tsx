import { constants as ethersConstants } from "ethers";
import { FC } from "react";

import { AsyncTask } from "src/utils/types";
import Button from "src/views/shared/button/button.view";
import { Token } from "src/domain";

interface BridgeButtonProps {
  hasAllowanceTask: AsyncTask<boolean, string>;
  approvalTask: AsyncTask<null, string>;
  token: Token;
  onApprove: () => void;
  onBridge: () => void;
}

const BridgeButton: FC<BridgeButtonProps> = ({
  token,
  hasAllowanceTask,
  approvalTask,
  onApprove,
  onBridge,
}) => {
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
