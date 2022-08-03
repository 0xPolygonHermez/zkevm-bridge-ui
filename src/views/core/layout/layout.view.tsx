import { FC, PropsWithChildren } from "react";

import useLayoutStyles from "src/views/core/layout/layout.styles";
import Snackbar from "src/views/shared/snackbar/snackbar.view";
import { useUIContext } from "src/contexts/ui.context";
import { reportError } from "src/adapters/error";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  const { snackbar, closeSnackbar } = useUIContext();

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
