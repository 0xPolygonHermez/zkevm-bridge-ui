import { FC, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BigNumber } from "ethers";

import useBridgeDetailsStyles from "src/views/bridge-details/bridge-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Chain from "src/views/bridge-details/components/chain/chain";
import Error from "src/views/shared/error/error.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useErrorContext } from "src/contexts/error.context";
import { useEnvContext } from "src/contexts/env.context";
import { parseError } from "src/adapters/error";
import { getTransactions } from "src/adapters/bridge-api";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { getTransactionStatus, getChainName } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";
import { calculateTransactionResponseFee } from "src/utils/fees";
import { Transaction } from "src/domain";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";

interface HistoricalFees {
  step1?: string;
  step2?: string;
}

const calculateHistoricalFees = (transaction: Transaction): Promise<HistoricalFees> => {
  const feeToString = (fee: BigNumber | undefined) =>
    fee ? formatTokenAmount(fee, transaction.bridge.token) : undefined;

  const step1Promise = transaction.bridge.networkId.provider
    .getTransaction(transaction.bridge.txHash)
    .then(calculateTransactionResponseFee)
    .then(feeToString);

  const step2Promise =
    transaction.status === "completed"
      ? transaction.bridge.destinationNetwork.provider
          .getTransaction(transaction.claim.txHash)
          .then(calculateTransactionResponseFee)
          .then(feeToString)
      : Promise.resolve(undefined);

  return Promise.all([step1Promise, step2Promise]).then(([step1, step2]) => ({
    step1,
    step2,
  }));
};

const BridgeDetails: FC = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { notifyError } = useErrorContext();
  const { claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();
  const env = useEnvContext();

  const [transaction, setTransaction] = useState<AsyncTask<Transaction, string>>({
    status: "pending",
  });
  const [historicalFees, setHistoricalFees] = useState<HistoricalFees>({});

  const classes = useBridgeDetailsStyles({
    status: transaction.status === "successful" ? transaction.data.status : undefined,
  });

  const onClaim = () => {
    if (transaction.status === "successful" && transaction.data.status === "on-hold") {
      const tx = transaction.data;
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
      })
        .then(() => {
          navigate(routes.activity.path);
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                setIncorrectNetworkMessage(
                  `Switch to ${getChainName(tx.bridge.destinationNetwork)} to continue`
                );
              } else {
                notifyError(error);
              }
            });
          }
        });
    }
  };

  useEffect(() => {
    if (transaction.status === "successful") {
      if (transaction.data.bridge.destinationNetwork.chainId === connectedProvider?.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, transaction]);

  useEffect(() => {
    if (env && account.status === "successful") {
      // ToDo: Get all the data only for the right bridge
      void getTransactions({ env, ethereumAddress: account.data })
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
        .catch(notifyError);
    }
  }, [account, env, transactionId, notifyError]);

  useEffect(() => {
    if (transaction.status === "successful") {
      calculateHistoricalFees(transaction.data).then(setHistoricalFees).catch(notifyError);
    }
  }, [transaction, notifyError]);

  if (transaction.status === "pending" || transaction.status === "loading") {
    return <SpinnerIcon />;
  }

  if (transaction.status === "failed") {
    return <Navigate to={routes.activity.path} replace />;
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

  const { step1: step1Fee, step2: step2Fee } = historicalFees;

  if (env === undefined) {
    return null;
  }

  return (
    <>
      <Header title="Bridge Details" backTo="activity" />
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
        {step1Fee && (
          <div className={classes.row}>
            <Typography type="body2" className={classes.alignRow}>
              Step 1 Fee ({getChainName(transaction.data.bridge.networkId)})
            </Typography>
            <Typography type="body1" className={classes.alignRow}>
              {step1Fee} {env.tokens.ETH.symbol}
            </Typography>
          </div>
        )}
        {step2Fee && (
          <div className={classes.row}>
            <Typography type="body2" className={classes.alignRow}>
              Step 2 Fee ({getChainName(transaction.data.bridge.destinationNetwork)})
            </Typography>
            <Typography type="body1" className={classes.alignRow}>
              {step2Fee} {env.tokens.ETH.symbol}
            </Typography>
          </div>
        )}
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Track step 1 transaction
          </Typography>
          <a href={bridgeTxUrl} target="_blank" className={classes.explorerButton} rel="noreferrer">
            <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
          </a>
        </div>
        {claimTxUrl && (
          <div className={`${classes.row} ${classes.lastRow}`}>
            <Typography type="body2" className={classes.alignRow}>
              Track step 2 transaction
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
          <Button onClick={onClaim} disabled={status === "initiated"}>
            Finalise
            {status === "initiated" && <SpinnerIcon className={classes.finaliseSpinner} />}
          </Button>
          {incorrectNetworkMessage && <Error error={incorrectNetworkMessage} />}
        </div>
      )}
    </>
  );
};

export default BridgeDetails;
