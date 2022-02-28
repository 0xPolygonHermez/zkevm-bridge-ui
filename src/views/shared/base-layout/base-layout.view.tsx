import React from "react";
import { useTheme } from "react-jss";
import { AppAction } from "src/store";
import { SnackbarState, HeaderState } from "src/store/global/global.reducer";
import MainHeader from "src/views/shared/main-header/main-header.view";
import PageHeader from "src/views/shared/page-header/page-header.view";
import Snackbar from "src/views/shared/snackbar/snackbar.view";
import Spinner from "src/views/shared/spinner/spinner.view";
import { AsyncTask } from "src/utils/types";
import UnderMaintenanceError from "src/views/shared/under-maintenance-error/under-maintenance-error.view";
import { Theme } from "src/styles/theme";
import useBaseLayoutStyles from "src/views/shared/base-layout/base-layout.styles";
//domain
import { FiatExchangeRates, HermezStatus } from "src/domain";

interface BaseLayoutProps {
  header: HeaderState;
  snackbar: SnackbarState;
  fiatExchangeRatesTask: AsyncTask<FiatExchangeRates, string>;
  hermezStatusTask: AsyncTask<HermezStatus, string>;
  onGoBack: (action: AppAction) => void;
  onClose: (action: AppAction) => void;
  onCloseSnackbar: () => void;
  onReportFromSnackbar: (error: string) => void;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  header,
  snackbar,
  children,
  fiatExchangeRatesTask,
  hermezStatusTask,
  onGoBack,
  onClose,
  onCloseSnackbar,
  onReportFromSnackbar,
}) => {
  const theme = useTheme<Theme>();
  const classes = useBaseLayoutStyles();

  if (hermezStatusTask.status === "successful" && hermezStatusTask.data.isUnderMaintenance) {
    return <UnderMaintenanceError />;
  }

  if (hermezStatusTask.status !== "successful" || fiatExchangeRatesTask.status !== "successful") {
    return (
      <>
        <div className={classes.spinnerContainer}>
          <Spinner size={theme.spacing(8)} />
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
  }

  return (
    <>
      {header.type === "main" && <MainHeader />}
      {header.type === "page" && (
        <PageHeader
          title={header.data.title}
          subtitle={header.data.subtitle}
          goBackAction={header.data.goBackAction}
          closeAction={header.data.closeAction}
          onGoBack={onGoBack}
          onClose={onClose}
        />
      )}
      {children}
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

export default BaseLayout;
