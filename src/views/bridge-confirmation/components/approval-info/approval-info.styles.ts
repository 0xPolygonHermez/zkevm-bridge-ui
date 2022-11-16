import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useApprovalInfoStyles = createUseStyles((theme: Theme) => ({
  approvalInfo: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
}));

export default useApprovalInfoStyles;
