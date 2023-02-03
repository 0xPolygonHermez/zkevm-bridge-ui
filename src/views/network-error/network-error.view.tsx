import { FC, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { providerError } from "src/adapters/error";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { ProviderError } from "src/domain";
import { routes } from "src/routes";
import { useNetworkErrorStyles } from "src/views/network-error/network-error.styles";
import { Typography } from "src/views/shared/typography/typography.view";

export const NetworkError: FC = () => {
  const classes = useNetworkErrorStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const env = useEnvContext();

  useEffect(() => {
    if (env) {
      navigate(routes.home.path);
    }
  }, [env, navigate]);

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
      <button className={classes.button} onClick={() => navigate(routes.home.path)} type="button">
        Try again
      </button>
    </div>
  ) : (
    <Navigate to={routes.home.path} />
  );
};
