import { FC, PropsWithChildren, useEffect, useState } from "react";

import { reportError } from "src/adapters/error";
import { useEnvContext } from "src/contexts/env.context";
import { useUIContext } from "src/contexts/ui.context";
import useLayoutStyles from "src/views/core/layout/layout.styles";
import ConfirmPopUp from "src/views/shared/confirm-pop-up/confirm-pop-up.view";
import Snackbar from "src/views/shared/snackbar/snackbar.view";
import Typography from "src/views/shared/typography/typography.view";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  const { closeSnackbar, snackbar } = useUIContext();
  const [showNetworkOutdatedPopUp, setShowNetworkOutdatedPopUp] = useState(false);
  const env = useEnvContext();

  const onCloseSnackbar = closeSnackbar;
  const onReportFromSnackbar = reportError;

  useEffect(() => {
    if (env) {
      setShowNetworkOutdatedPopUp(env.outdatedNetwork.message !== undefined);
    }
  }, [env]);

  return (
    <>
      <div className={classes.layout}>
        <div className={classes.container}>{children}</div>
      </div>
      {snackbar.status === "open" && (
        <Snackbar
          message={snackbar.message}
          onClose={onCloseSnackbar}
          onReport={onReportFromSnackbar}
        />
      )}
      {showNetworkOutdatedPopUp && env && env.outdatedNetwork.message && (
        <ConfirmPopUp
          message={
            <div>
              <Typography type="body2">{env.outdatedNetwork.message}</Typography>
              {env.outdatedNetwork.url && (
                <Typography className={classes.linkContainer} type="body2">
                  <a className={classes.link} href={env.outdatedNetwork.url}>
                    {env.outdatedNetwork.url}
                  </a>
                </Typography>
              )}
            </div>
          }
          onClose={() => setShowNetworkOutdatedPopUp(false)}
          onConfirm={() => setShowNetworkOutdatedPopUp(false)}
          showCancelButton={false}
          title={env.outdatedNetwork.title}
        />
      )}
    </>
  );
};

export default Layout;
