import { useState, FC } from "react";

import TransactionCard from "src/views/activity/components/transaction-card/transaction-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import { demoData } from "src/views/activity/demo-data";

const Activity: FC = () => {
  const [displayAll, setDisplayAll] = useState(true);
  const classes = useActivityStyles({ displayAll });
  const pendingActivities = demoData.filter(
    (data) => data.status !== "completed" && data.status !== "failed"
  );
  const transactionsList = displayAll ? demoData : pendingActivities;

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  return (
    <>
      <Header title="Activity" backTo="home" />
      <div className={classes.selectorBoxes}>
        <div className={`${classes.selectorBox} ${classes.allBox}`} onClick={onDisplayAll}>
          <Typography type="body1" className={classes.status}>
            All
          </Typography>
          <Typography type="body2" className={classes.numberAllBox}>
            {demoData.length}
          </Typography>
        </div>
        <div className={`${classes.selectorBox} ${classes.pendingBox}`} onClick={onDisplayPending}>
          <Typography type="body1" className={classes.status}>
            Pending
          </Typography>
          <Typography type="body2" className={classes.numberPendingBox}>
            {pendingActivities.length}
          </Typography>
        </div>
      </div>
      {transactionsList.map((transaction) => (
        <TransactionCard {...transaction} key={transaction.id} />
      ))}
    </>
  );
};

export default Activity;
