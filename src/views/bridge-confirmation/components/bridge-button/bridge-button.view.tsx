import { FC } from "react";

import { AsyncTask } from "src/utils/types";
import Button from "src/views/shared/button/button.view";
import { Token } from "src/domain";

interface BridgeButtonProps {
  isDisabled?: boolean;
  isTxApprovalRequired: boolean;
  approvalTask: AsyncTask<null, string>;
  token: Token;
  onApprove: () => void;
  onBridge: () => void;
}

const BridgeButton: FC<BridgeButtonProps> = ({
  isDisabled = false,
  token,
  isTxApprovalRequired,
  approvalTask,
  onApprove,
  onBridge,
}) => {
  const bridgeButton = (
    <Button onClick={onBridge} disabled={isDisabled}>
      Bridge
    </Button>
  );

  if (isTxApprovalRequired) {
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
  } else {
    return bridgeButton;
  }
};

export default BridgeButton;
