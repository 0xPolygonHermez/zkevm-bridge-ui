import { useState, FC, useEffect } from "react";

import TransactionCard from "src/views/activity/components/transaction-card/transaction-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { Transaction } from "src/domain";
import { getChainName } from "src/utils/labels";

const Activity: FC = () => {
  const { getTransactions, claim } = useBridgeContext();
  const { account, isConnectedProviderChainOk, changeNetwork } = useProvidersContext();
  const { openSnackbar } = useUIContext();
  const [transactionList, setTransactionsList] = useState<Transaction[]>([]);
  const [displayAll, setDisplayAll] = useState(true);
  const classes = useActivityStyles({ displayAll });

  const pendingTransactions = transactionList.filter((data) => data.status !== "completed");
  const filteredList = displayAll ? transactionList : pendingTransactions;

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = async (tx: Transaction) => {
    if (tx.status === "on-hold") {
      if (!(await isConnectedProviderChainOk(tx.bridge.destinationNetwork))) {
        try {
          await changeNetwork(tx.bridge.destinationNetwork);
        } catch (error) {
          return `Switch to ${getChainName(tx.bridge.destinationNetwork)} to continue`;
        }
      }
      void claim({
        token: tx.bridge.token,
        amount: tx.bridge.amount,
        destinationNetwork: tx.bridge.destinationNetwork,
        destinationAddress: tx.bridge.destinationAddress,
        index: tx.bridge.depositCount,
        smtProof: tx.merkleProof.merkleProof,
        globalExitRootNum: tx.merkleProof.exitRootNumber,
        l2GlobalExitRootNum: tx.merkleProof.l2ExitRootNumber,
        mainnetExitRoot: tx.merkleProof.mainExitRoot,
        rollupExitRoot: tx.merkleProof.rollupExitRoot,
      }).catch((error) => {
        if (isMetamaskUserRejectedRequestError(error) === false) {
          void parseError(error).then((parsed) => {
            openSnackbar({
              type: "error",
              parsed,
            });
          });
        }
      });
    }
  };

  useEffect(() => {
    if (account.status === "successful") {
      void getTransactions({ ethereumAddress: account.data })
        .then((transactions) => {
          setTransactionsList(transactions);
        })
        .catch((error) => {
          void parseError(error).then((parsed) => {
            openSnackbar({
              type: "error",
              parsed,
            });
          });
        });
    }
  }, [account, getTransactions, openSnackbar]);

  return (
    <>
      <Header title="Activity" backTo="home" />
      <div className={classes.selectorBoxes}>
        <div className={`${classes.selectorBox} ${classes.allBox}`} onClick={onDisplayAll}>
          <Typography type="body1" className={classes.status}>
            All
          </Typography>
          <Typography type="body2" className={classes.numberAllBox}>
            {transactionList.length}
          </Typography>
        </div>
        <div className={`${classes.selectorBox} ${classes.pendingBox}`} onClick={onDisplayPending}>
          <Typography type="body1" className={classes.status}>
            Pending
          </Typography>
          <Typography type="body2" className={classes.numberPendingBox}>
            {pendingTransactions.length}
          </Typography>
        </div>
      </div>
      {filteredList.map((transaction) => (
        <TransactionCard
          transaction={transaction}
          onClaim={() => onClaim(transaction)}
          key={transaction.id}
        />
      ))}
    </>
  );
};

export default Activity;
