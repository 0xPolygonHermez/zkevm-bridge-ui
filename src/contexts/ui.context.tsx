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

interface UIContext {
  snackbar: SnackbarState;
  openSnackbar: (message: Message) => void;
  closeSnackbar: () => void;
}

const uiContextNotReadyErrorMsg = "The ui context is not yet ready";

const uiContextDefaultValue: UIContext = {
  snackbar: { status: "closed" },
  openSnackbar: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
  closeSnackbar: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
};

const uiContext = createContext<UIContext>(uiContextDefaultValue);

const UIProvider: FC = (props) => {
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
    [openSnackbar, closeSnackbar, snackbar]
  );

  return <uiContext.Provider value={value} {...props} />;
};

const useUIContext = (): UIContext => {
  return useContext(uiContext);
};

export { UIProvider, useUIContext };
