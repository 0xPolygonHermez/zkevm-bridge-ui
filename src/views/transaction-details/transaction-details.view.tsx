import { FC, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import useTransactionDetailsStyles from "src/views/transaction-details/transaction-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Chain from "src/views/transaction-details/components/chain/chain";
import { getTransactionStatusText, Transaction } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";
import { AsyncTask } from "src/utils/types";
import { formatEther } from "ethers/lib/utils";

const TransactionDetails: FC = () => {
  const { transactionId } = useParams();
  const env = useEnvContext();
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
      const {
        tokenAddress,
        destinationAddress,
        merkleProof,
        exitRootNumber,
        mainExitRoot,
        rollupExitRoot,
      } = transaction.data;
      const originNetwork = destinationNetwork === 0 ? 1 : 0;

      // ToDo: parse the error
      void claim(
        tokenAddress,
        amount,
        originNetwork.toString(),
        destinationNetwork,
        destinationAddress,
        merkleProof,
        exitRootNumber,
        mainExitRoot,
        rollupExitRoot
      );
    }
  };

  useEffect(() => {
    if (account.status === "successful") {
      // ToDo: Get all the data only for the right bridge
      void getTransactions({ ethereumAddress: account.data })
        .then((transactions) => {
          const foundTransaction = transactions.find((tx) => {
            const id = `${tx.destinationNetwork}-${tx.depositCount}`;
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

  const { amount, destinationNetwork, status } = transaction.data;

  return (
    <>
      <Header title="Transaction Details" backTo="activity" />
      <Card className={classes.card}>
        <div className={classes.balance}>
          {env && <Icon url={env.tokens.ETH.logoURI} className={classes.tokenIcon} size={48} />}
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
          <Chain
            chain={destinationNetwork === 0 ? "polygon" : "ethereum"}
            className={classes.alignRow}
          />
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            To
          </Typography>
          <Chain
            chain={destinationNetwork === 0 ? "ethereum" : "polygon"}
            className={classes.alignRow}
          />
        </div>
        {/* <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            L2 Fee
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {env && <Icon url={env.tokens.ETH.logoURI} size={20} />} 0.01ETH
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            L1 gas fee
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {env && <Icon url={env.tokens.ETH.logoURI} size={20} />} 0.01ETH
          </Typography>
        </div> */}
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
