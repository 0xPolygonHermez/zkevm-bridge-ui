import { FC, PropsWithChildren } from "react";

import { reportError } from "src/adapters/error";
import { useEnvContext } from "src/contexts/env.context";
import { useUIContext } from "src/contexts/ui.context";
import { useLayoutStyles } from "src/views/core/layout/layout.styles";
import { Snackbar } from "src/views/shared/snackbar/snackbar.view";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  const { closeSnackbar, snackbar } = useUIContext();
  const env = useEnvContext();

  const onCloseSnackbar = closeSnackbar;
  const onReportFromSnackbar = reportError;

  return (
    <>
      <div className={classes.layout}>
        <div className={classes.container}>{children}</div>
      </div>
      {env && snackbar.status === "open" && (
        <Snackbar
          message={snackbar.message}
          onClose={onCloseSnackbar}
          onReport={onReportFromSnackbar}
          reportForm={env.reportForm}
        />
      )}
    </>
  );
};
