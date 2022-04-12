import { FC } from "react";

import useLayoutStyles from "src/views/core/layout/layout.styles";
import Snackbar from "src/views/shared/snackbar/snackbar.view";
import Modal from "src/views/shared/modal/modal.view";
import { useUIContext } from "src/contexts/ui.context";
import { reportError } from "src/adapters/error";

const Layout: FC = ({ children }) => {
  const classes = useLayoutStyles();
  const { snackbar, closeSnackbar, modal, closeModal } = useUIContext();

  const onCloseSnackbar = closeSnackbar;
  const onReportFromSnackbar = reportError;
  const onCloseModal = closeModal;

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
      {modal.status === "open" && <Modal component={modal.component} onClose={onCloseModal} />}
    </>
  );
};

export default Layout;
