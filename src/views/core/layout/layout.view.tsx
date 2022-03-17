import { FC } from "react";

import useLayoutStyles from "src/views/core/layout/layout.styles";
import Snackbar from "src/views/shared/snackbar/snackbar.view";
import { useGlobalContext } from "src/contexts/global.context";
import { reportError } from "src/adapters/error";

const Layout: FC = ({ children }) => {
  const classes = useLayoutStyles();
  const { snackbar, closeSnackbar } = useGlobalContext();

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
