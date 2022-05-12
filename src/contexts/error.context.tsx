import { createContext, FC, useCallback, useContext, useMemo } from "react";

import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";

interface ErrorContext {
  notifyError: (error: unknown) => void;
}

const errorContextNotReadyErrorMsg = "The error context is not yet ready";

const errorContextDefaultValue: ErrorContext = {
  notifyError: () => {
    console.error(errorContextNotReadyErrorMsg);
  },
};

const errorContext = createContext<ErrorContext>(errorContextDefaultValue);

const ErrorProvider: FC = (props) => {
  const { openSnackbar } = useUIContext();

  const notifyError = useCallback(
    (error: unknown): void => {
      void parseError(error)
        .then((parsed) => openSnackbar({ type: "error", parsed }))
        .catch(console.error);
    },
    [openSnackbar]
  );

  const value = useMemo(() => ({ notifyError }), [notifyError]);

  return <errorContext.Provider value={value} {...props} />;
};

const useErrorContext = (): ErrorContext => {
  return useContext(errorContext);
};

export { ErrorProvider, useErrorContext };
