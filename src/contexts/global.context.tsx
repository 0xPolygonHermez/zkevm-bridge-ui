import { createContext, FC, useCallback, useContext, useMemo, useState } from "react";

import { Message } from "src/domain";

type SnackbarState =
  | {
      status: "closed";
    }
  | {
      status: "open";
      message: Message;
    };

interface GlobalContext {
  snackbar: SnackbarState;
  openSnackbar: (message: Message) => void;
  closeSnackbar: () => void;
}

const globalContextNotReadyErrorMsg = "The global context is not yet ready";

const globalContextDefaultValue: GlobalContext = {
  snackbar: { status: "closed" },
  openSnackbar: () => {
    console.error(globalContextNotReadyErrorMsg);
  },
  closeSnackbar: () => {
    console.error(globalContextNotReadyErrorMsg);
  },
};

const globalContext = createContext<GlobalContext>(globalContextDefaultValue);

const GlobalProvider: FC = (props) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    status: "closed",
  });

  const openSnackbar = useCallback(
    (message: Message): void =>
      setSnackbar({
        status: "open",
        message,
      }),
    []
  );

  const closeSnackbar = useCallback(
    (): void =>
      setSnackbar({
        status: "closed",
      }),
    []
  );

  const value = useMemo(
    () => ({ snackbar, openSnackbar, closeSnackbar }),
    [closeSnackbar, openSnackbar, snackbar]
  );

  return <globalContext.Provider value={value} {...props} />;
};

const useGlobalContext = (): GlobalContext => {
  return useContext(globalContext);
};

export { GlobalProvider, useGlobalContext };
