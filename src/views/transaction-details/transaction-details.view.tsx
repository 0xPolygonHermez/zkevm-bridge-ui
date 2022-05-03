import { FC, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatEther } from "ethers/lib/utils";

import useTransactionDetailsStyles from "src/views/transaction-details/transaction-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Chain from "src/views/transaction-details/components/chain/chain";
import { getTransactionStatusText, Transaction } from "src/domain";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";

const TransactionDetails: FC = () => {
  const { transactionId } = useParams();
  const { openSnackbar } = useUIContext();
  const { getTransactions, claim } = useBridgeContext();
  const { account } = useProvidersContext();
  const [transaction, setTransaction] = useState<AsyncTask<Transaction, string>>({
    status: "pending",
  });
  const classes = useTransactionDetailsStyles({
    status: transaction.status === "successful" ? transaction.data.status : undefined,
  });

  const onClaim = () => {
    if (transaction.status === "successful" && transaction.data.status === "on-hold") {
      const tx = transaction.data;
      void claim({
        originalTokenAddress: tx.token.address,
        amount: tx.amount,
        originalNetwork: tx.originNetwork.networkId.toString(),
        destinationNetwork: tx.destinationNetwork,
        destinationAddress: tx.destinationAddress,
        index: tx.depositCount,
        smtProof: tx.merkleProof,
        globalExitRootNum: tx.exitRootNumber,
        mainnetExitRoot: tx.mainExitRoot,
        rollupExitRoot: tx.rollupExitRoot,
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
      // ToDo: Get all the data only for the right bridge
      void getTransactions({ ethereumAddress: account.data })
        .then((transactions) => {
          const foundTransaction = transactions.find((tx) => {
            const id = `${tx.destinationNetwork.networkId}-${tx.depositCount}`;
            return id === transactionId;
          });
          if (foundTransaction) {
            setTransaction({
              status: "successful",
              data: foundTransaction,
            });
          } else {
            setTransaction({
              status: "failed",
              error: "Transaction not found",
            });
          }
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
  }, [getTransactions, openSnackbar, transactionId, account]);

  if (transaction.status === "pending" || transaction.status === "loading") {
    return <SpinnerIcon />;
  }

  if (transaction.status === "failed") {
    return <Navigate to="/activity" replace />;
  }

  const { amount, destinationNetwork, originNetwork, status, token } = transaction.data;

  return (
    <>
      <Header title="Transaction Details" backTo="activity" />
      <Card className={classes.card}>
        <div className={classes.balance}>
          <Icon url={token.logoURI} className={classes.tokenIcon} size={48} />
          <Typography type="h2">{`${formatEther(amount)} ETH`}</Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Status
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <span className={classes.dot} />
            {getTransactionStatusText(status)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            From
          </Typography>
          <Chain chain={originNetwork} className={classes.alignRow} />
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            To
          </Typography>
          <Chain chain={destinationNetwork} className={classes.alignRow} />
        </div>
        <div className={`${classes.row} ${classes.lastRow}`}>
          <Typography type="body2" className={classes.alignRow}>
            Track transaction
          </Typography>
          <Link to="#" target="_blank" className={classes.explorerButton}>
            <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
          </Link>
        </div>
      </Card>
      {(status === "initiated" || status === "on-hold") && (
        <div className={classes.finaliseRow}>
          <button
            onClick={onClaim}
            className={classes.finaliseButton}
            disabled={status === "initiated"}
          >
            <Typography type="body1" className={classes.finaliseButtonText}>
              Finalize
            </Typography>
            {status === "initiated" && <SpinnerIcon className={classes.finaliseSpinner} />}
          </button>
        </div>
      )}
    </>
  );
};

export default TransactionDetails;
