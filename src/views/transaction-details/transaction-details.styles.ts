import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";
import { TransactionCardProps } from "src/views/activity/components/transaction-card/transaction-card.view";

interface StylesProps {
  status: TransactionCardProps["status"];
}

const useTransactionDetailsStyles = createUseStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(3),
  },
  dot: {
    width: theme.spacing(0.75),
    height: theme.spacing(0.75),
    backgroundColor: ({ status }: StylesProps) =>
      status === "initiated" || status === "processing"
        ? theme.palette.warning.main
        : status === "on-hold" || status === "failed"
        ? theme.palette.error.main
        : theme.palette.success,
    borderRadius: "50%",
  },
  balance: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  tokenIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    margin: [theme.spacing(1), 0, theme.spacing(2)],
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: [theme.spacing(2.5), 0],
  },
  alignRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  hermezChain: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
  button: {
    display: "flex",
    cursor: "pointer",
    padding: [theme.spacing(1), theme.spacing(2)],
    gap: theme.spacing(1),
    alignItems: "center",
    border: "none",
    borderRadius: theme.spacing(1),
  },
}));

export default useTransactionDetailsStyles;
