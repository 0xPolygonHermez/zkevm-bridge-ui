import { FC } from "react";
import { constants as ethersConstants } from "ethers";

import { Token } from "src/domain";
import { AsyncTask } from "src/utils/types";
import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import useApprovalInfoStyles from "src/views/bridge-confirmation/components/approval-info/approval-info.styles";
import Typography from "src/views/shared/typography/typography.view";

interface ApprovalInfoProps {
  token: Token;
  hasAllowanceTask: AsyncTask<boolean, string>;
}

const ApprovalMessage: FC<ApprovalInfoProps> = ({ token, hasAllowanceTask }) => {
  const classes = useApprovalInfoStyles();

  if (token.address === ethersConstants.AddressZero) {
    return null;
  }

  if (
    hasAllowanceTask.status !== "successful" ||
    (hasAllowanceTask.status === "successful" && hasAllowanceTask.data)
  ) {
    return null;
  }

  return (
    <div className={classes.approvalInfo}>
      <InfoIcon />
      <Typography type="body2">Approval is needed once per token</Typography>
    </div>
  );
};

export default ApprovalMessage;
