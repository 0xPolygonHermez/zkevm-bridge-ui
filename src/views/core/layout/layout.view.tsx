import { FC, PropsWithChildren, useEffect, useState } from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useUIContext } from "src/contexts/ui.context";
import { useLayoutStyles } from "src/views/core/layout/layout.styles";
import { ConfirmPopUp } from "src/views/shared/confirm-pop-up/confirm-pop-up.view";
import { Snackbar } from "src/views/shared/snackbar/snackbar.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  const { closeSnackbar, snackbar } = useUIContext();
  const [showNetworkOutdatedPopUp, setShowNetworkOutdatedPopUp] = useState(false);
  const env = useEnvContext();

  const onCloseSnackbar = closeSnackbar;

  useEffect(() => {
    if (env) {
      setShowNetworkOutdatedPopUp(env.outdatedNetworkModal.isEnabled);
    }
  }, [env]);

  return (
    <>
      <div className={classes.layout}>
        <div className={classes.container}>{children}</div>
      </div>
      {snackbar.status === "open" && (
        <Snackbar message={snackbar.message} onClose={onCloseSnackbar} />
      )}
      {env && showNetworkOutdatedPopUp && env.outdatedNetworkModal.isEnabled && (
        <ConfirmPopUp
          message={
            <div>
              {env.outdatedNetworkModal.messageParagraph1 && (
                <Typography type="body2">{env.outdatedNetworkModal.messageParagraph1}</Typography>
              )}
              {env.outdatedNetworkModal.messageParagraph2 && (
                <>
                  <br />
                  <Typography type="body2">{env.outdatedNetworkModal.messageParagraph2}</Typography>
                </>
              )}
              {env.outdatedNetworkModal.url && (
                <Typography className={classes.linkContainer} type="body2">
                  <a className={classes.link} href={env.outdatedNetworkModal.url}>
                    {env.outdatedNetworkModal.url}
                  </a>
                </Typography>
              )}
            </div>
          }
          onClose={() => setShowNetworkOutdatedPopUp(false)}
          onConfirm={() => setShowNetworkOutdatedPopUp(false)}
          showCancelButton={false}
          title={env.outdatedNetworkModal.title}
        />
      )}
    </>
  );
};
