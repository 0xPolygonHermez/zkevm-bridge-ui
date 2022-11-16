import { FC, PropsWithChildren } from "react";

import { reportError } from "src/adapters/error";
import { useUIContext } from "src/contexts/ui.context";
import useLayoutStyles from "src/views/core/layout/layout.styles";
import Snackbar from "src/views/shared/snackbar/snackbar.view";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  const { closeSnackbar, snackbar } = useUIContext();

  const onCloseSnackbar = closeSnackbar;
  const onReportFromSnackbar = reportError;

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
    </>
  );
};

export default Layout;
