import { FC } from "react";
import { useNavigate } from "react-router-dom";

import useUnderMaintenanceStyles from "src/views/under-maintenance/under-maintenance.styles";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";

const UnderMaintenance: FC = () => {
  const classes = useUnderMaintenanceStyles();
  const navigate = useNavigate();

  return (
    <div className={classes.wrapper}>
      <PolygonZkEVMLogo className={classes.logo} />
      <div className={classes.textBox}>
        <Typography type="h1">Under maintenance</Typography>
        <Typography type="body1">
          Sorry, we are updating some nodes to improve performance.
        </Typography>
        <Typography type="body2">It will be operative again soon</Typography>
      </div>
      <button type="button" onClick={() => navigate(routes.login.path)} className={classes.button}>
        Try again
      </button>
    </div>
  );
};

export default UnderMaintenance;
