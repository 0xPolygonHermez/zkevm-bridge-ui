import { FC, PropsWithChildren, createContext, useCallback, useContext, useMemo } from "react";

import { parseError } from "src/adapters/error";
import { useUIContext } from "src/contexts/ui.context";

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

const ErrorProvider: FC<PropsWithChildren> = (props) => {
  const { openSnackbar } = useUIContext();

  const notifyError = useCallback(
    (error: unknown): void => {
      void parseError(error)
        .then((parsed) => openSnackbar({ parsed, type: "error" }))
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
