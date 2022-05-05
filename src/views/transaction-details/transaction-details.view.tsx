import { FC, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import useTransactionDetailsStyles from "src/views/transaction-details/transaction-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Chain from "src/views/transaction-details/components/chain/chain";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { getTransactionStatus } from "src/utils/labels";
import { Transaction } from "src/domain";
import { formatTokenAmount } from "src/utils/amounts";

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
      // ToDo: Get all the data only for the right bridge
      void getTransactions({ ethereumAddress: account.data })
        .then((transactions) => {
          const foundTransaction = transactions.find((tx) => {
            return tx.id === transactionId;
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

  const {
    status,
    bridge: { amount, destinationNetwork, networkId, token, txHash },
  } = transaction.data;

  const bridgeTxUrl = `${networkId.explorerUrl}/tx/${txHash}`;
  const claimTxUrl =
    transaction.data.status === "completed"
      ? `${destinationNetwork.explorerUrl}/tx/${transaction.data.claim.txHash}`
      : undefined;

  return (
    <>
      <Header title="Transaction Details" backTo="activity" />
      <Card className={classes.card}>
        <div className={classes.balance}>
          <Icon url={token.logoURI} className={classes.tokenIcon} size={48} />
          <Typography type="h2">{`${formatTokenAmount(amount, token)} ${token.symbol}`}</Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Status
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <span className={classes.dot} />
            {getTransactionStatus(status)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            From
          </Typography>
          <Chain chain={networkId} className={classes.alignRow} />
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            To
          </Typography>
          <Chain chain={destinationNetwork} className={classes.alignRow} />
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Step 1/2
          </Typography>
          <a href={bridgeTxUrl} target="_blank" className={classes.explorerButton} rel="noreferrer">
            <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
          </a>
        </div>
        {claimTxUrl && (
          <div className={`${classes.row} ${classes.lastRow}`}>
            <Typography type="body2" className={classes.alignRow}>
              Step 2/2
            </Typography>
            <a
              href={claimTxUrl}
              target="_blank"
              className={classes.explorerButton}
              rel="noreferrer"
            >
              <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
            </a>
          </div>
        )}
      </Card>
      {(status === "initiated" || status === "on-hold") && (
        <div className={classes.finaliseRow}>
          <button
            onClick={onClaim}
            className={classes.finaliseButton}
            disabled={status === "initiated"}
          >
            <Typography type="body1" className={classes.finaliseButtonText}>
              Finalise
            </Typography>
            {status === "initiated" && <SpinnerIcon className={classes.finaliseSpinner} />}
          </button>
        </div>
      )}
    </>
  );
};

export default TransactionDetails;
