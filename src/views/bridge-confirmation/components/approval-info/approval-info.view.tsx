import { FC } from "react";

import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import { useApprovalInfoStyles } from "src/views/bridge-confirmation/components/approval-info/approval-info.styles";
import { Typography } from "src/views/shared/typography/typography.view";

export const ApprovalInfo: FC = () => {
  const classes = useApprovalInfoStyles();

  return (
    <div className={classes.approvalInfo}>
      <InfoIcon />
      <Typography type="body2">Approval is needed once per token</Typography>
    </div>
  );
};
