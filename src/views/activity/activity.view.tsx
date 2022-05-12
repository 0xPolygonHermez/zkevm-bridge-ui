import { useState, FC, useEffect } from "react";

import TransactionCard from "src/views/activity/components/transaction-card/transaction-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { parseError } from "src/adapters/error";
import { getTransactions } from "src/adapters/bridge-api";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { AUTO_REFRESH_RATE } from "src/constants";
import { Transaction } from "src/domain";

const Activity: FC = () => {
  const env = useEnvContext();
  const { claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { parseAndNotify } = useErrorContext();
  const [transactionList, setTransactionsList] = useState<Transaction[]>([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [wrongNetworkTransactions, setWrongNetworkTransactions] = useState<Transaction["id"][]>([]);
  const classes = useActivityStyles({ displayAll });

  const pendingTransactions = transactionList.filter((data) => data.status !== "completed");
  const filteredList = displayAll ? transactionList : pendingTransactions;

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (tx: Transaction) => {
    if (tx.status === "on-hold") {
      claim({
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
            if (parsed === "wrong-network") {
              setWrongNetworkTransactions([...wrongNetworkTransactions, tx.id]);
            } else {
              parseAndNotify(error);
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (env && account.status === "successful") {
      const loadTransactions = () => {
        getTransactions({ env, ethereumAddress: account.data })
          .then((transactions) => {
            setTransactionsList(transactions);
          })
          .catch(parseAndNotify);
      };
      const intervalId = setInterval(loadTransactions, AUTO_REFRESH_RATE);
      loadTransactions();

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [account, env, parseAndNotify]);

  useEffect(() => {
    setWrongNetworkTransactions([]);
  }, [connectedProvider?.chainId]);

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
          networkError={wrongNetworkTransactions.includes(transaction.id)}
          key={transaction.id}
        />
      ))}
    </>
  );
};

export default Activity;
