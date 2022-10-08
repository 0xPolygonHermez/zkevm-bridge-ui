import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useUnderMaintenanceStyles from "src/views/under-maintenance/under-maintenance.styles";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import { providerError } from "src/adapters/error";

const UnderMaintenance: FC = () => {
  const classes = useUnderMaintenanceStyles();
  const navigate = useNavigate();
  const { state } = useLocation();

  const parsedProviderError = providerError.nullable().safeParse(state);

  const renderProviderError = () => {
    if (parsedProviderError.success && parsedProviderError.data) {
      return `${parsedProviderError.data} testnet node`;
    }
    return "L1 or L2 testnet nodes";
  };

  return (
    <div className={classes.wrapper}>
      <PolygonZkEVMLogo className={classes.logo} />
      <div className={classes.textBox}>
        <Typography type="h1">Network Error</Typography>
        <Typography type="body1">We can not connect with the {renderProviderError()}.</Typography>
        <Typography type="body2">It will be operative again soon</Typography>
      </div>
      <button type="button" onClick={() => navigate(routes.login.path)} className={classes.button}>
        Try again
      </button>
    </div>
  );
};

export default UnderMaintenance;
