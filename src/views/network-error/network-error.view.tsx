import { FC } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

import useNetworkErrorStyles from "src/views/network-error/network-error.styles";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { ProviderError, providerError } from "src/adapters/error";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";

const NetworkError: FC = () => {
  const classes = useNetworkErrorStyles();
  const navigate = useNavigate();
  const { state } = useLocation();

  const parsedProviderError = providerError.safeParse(state);

  return parsedProviderError.success ? (
    <div className={classes.wrapper}>
      <PolygonZkEVMLogo className={classes.logo} />
      <div className={classes.textBox}>
        <Typography type="h1">Network Error</Typography>
        <Typography type="body1">
          {parsedProviderError.data === ProviderError.Ethereum
            ? "We cannot connect to the Ethereum node."
            : "We cannot connect to the Polygon zkEVM node."}
        </Typography>
        <Typography type="body2">It will be operative again soon</Typography>
      </div>
      <button type="button" onClick={() => navigate(routes.home.path)} className={classes.button}>
        Try again
      </button>
    </div>
  ) : (
    <Navigate to={routes.home.path} />
  );
};

export default NetworkError;
