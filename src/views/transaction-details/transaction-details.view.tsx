import { FC } from "react";
import { Link, useParams } from "react-router-dom";

import useTransactionDetailsStyles from "src/views/transaction-details/transaction-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as EthChainIcon } from "src/assets/icons/ethereum.svg";
import { ReactComponent as HermezChainIcon } from "src/assets/icons/polygon-hermez.svg";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "../shared/typography/typography.view";
import { StatusText } from "../activity/components/transaction-card/transaction-card.view";
import { demoData } from "../activity/demo-data";
import { getTimeFromNow } from "src/utils/time";
import { convertTokenAmountToFiat } from "src/utils/amounts";
import TokenIcon from "../shared/token-icon/token-icon";

const TransactionDetails: FC = () => {
  const { transactionId } = useParams();
  const data = demoData.find((demo) => demo.id.toString() === transactionId);
  const classes = useTransactionDetailsStyles({ status: data?.status || "initiated" });
  const ethChain = (
    <>
      <EthChainIcon /> Ethereum chain
    </>
  );
  const hermezChain = (
    <>
      <HermezChainIcon className={classes.hermezChain} /> Polygon Hermez chain
    </>
  );
  const chain = {
    l1: { from: hermezChain, to: ethChain },
    l2: { from: ethChain, to: hermezChain },
  };

  if (!data) return null;
  const { amount, token, timestamp, type, status } = data;
  return (
    <>
      <Header title="Transaction Details" />
      <Card className={classes.card}>
        <div className={classes.balance}>
          <TokenIcon token={token} className={classes.tokenIcon} />
          <Typography type="h2">{`${amount} ${token.toUpperCase()}`}</Typography>
          <Typography type="body2">{convertTokenAmountToFiat({ amount, token })}</Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Status
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <span className={classes.dot} />
            {StatusText[status]}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            {status === "initiated" ? "Confirmation expected in" : "Date"}
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {status === "initiated" ? (
              <>
                Estimating Time <SpinnerIcon />
              </>
            ) : (
              <>{getTimeFromNow({ timestamp })} ago</>
            )}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            From
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {chain[type].from}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            To
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            {chain[type].to}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            L2 Fee
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <TokenIcon token="eth" /> 0.00ETH
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            L1 gas fee
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <TokenIcon token="eth" /> 0.00ETH
          </Typography>
        </div>
        <div className={classes.row}>
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
          <button className={classes.finaliseButton} disabled={status === "initiated"}>
            <Typography type="body1" className={classes.finaliseButtonText}>
              Finalise
            </Typography>
          </button>
        </div>
      )}
    </>
  );
};

export default TransactionDetails;
