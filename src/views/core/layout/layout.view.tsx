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
      setShowNetworkOutdatedPopUp(env.isNetworkOutdated);
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
      {showNetworkOutdatedPopUp && (
        <ConfirmPopUp
          message={
            <Typography type="body2">
              In the coming days, a new zkEVM Testnet (Grapefruit) will be released to the public,
              and this version (Litchi) will be outdated. We will update this message with the link
              to the newest version when it&apos;s deployed.
            </Typography>
          }
          onClose={() => setShowNetworkOutdatedPopUp(false)}
          onConfirm={() => setShowNetworkOutdatedPopUp(false)}
          showCancelButton={false}
          title="A new zkEVM Testnet is on its way!"
        />
      )}
    </>
  );
};

export default Layout;
