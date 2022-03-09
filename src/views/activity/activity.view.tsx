import { useState } from "react";

import TrasnsactionCard from "src/views/activity/components/transaction-card/transaction-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import { demoData } from "src/views/activity/demo-data";

const Activity = () => {
  const classes = useActivityStyles();
  const [listAll, setListAll] = useState(true);
  const pendingActivities = demoData.filter(
    (data) => data.status !== "complete" && data.status !== "error"
  );
  const transactionsList = listAll ? demoData : pendingActivities;

  const changeList = () => {
    setListAll(!listAll);
  };

  return (
    <>
      <Header title={"Activity"} />
      <div className={classes.selectorBoxes}>
        <div
          className={`${classes.selectorBox} ${!listAll ? classes.inactiveBox : ""}`}
          onClick={!listAll ? changeList : undefined}
        >
          <Typography type={"body1"} className={classes.status}>
            All
          </Typography>
          <Typography
            type={"body2"}
            className={`${classes.number} ${!listAll ? classes.inactiveNumber : ""}`}
          >
            {demoData.length}
          </Typography>
        </div>
        <div
          className={`${classes.selectorBox} ${listAll ? classes.inactiveBox : ""}`}
          onClick={listAll ? changeList : undefined}
        >
          <Typography type={"body1"} className={classes.status}>
            Pending
          </Typography>
          <Typography
            type={"body2"}
            className={`${classes.number} ${listAll ? classes.inactiveNumber : ""}`}
          >
            {pendingActivities.length}
          </Typography>
        </div>
      </div>
      {transactionsList.map((transaction) => (
        <TrasnsactionCard {...transaction} key={transaction.id} />
      ))}
    </>
  );
};

export default Activity;
