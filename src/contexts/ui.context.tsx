import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Message } from "src/domain";

type SnackbarState =
  | {
      status: "closed";
    }
  | {
      message: Message;
      status: "open";
    };

interface UIContext {
  closeSnackbar: () => void;
  openSnackbar: (message: Message) => void;
  snackbar: SnackbarState;
}

const uiContextNotReadyErrorMsg = "The ui context is not yet ready";

const uiContextDefaultValue: UIContext = {
  closeSnackbar: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
  openSnackbar: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
  snackbar: { status: "closed" },
};

const uiContext = createContext<UIContext>(uiContextDefaultValue);

const UIProvider: FC<PropsWithChildren> = (props) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    status: "closed",
  });

  const openSnackbar = useCallback(
    (message: Message): void =>
      setSnackbar({
        message,
        status: "open",
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
    () => ({ closeSnackbar, openSnackbar, snackbar }),
    [openSnackbar, closeSnackbar, snackbar]
  );

  return <uiContext.Provider value={value} {...props} />;
};

const useUIContext = (): UIContext => {
  return useContext(uiContext);
};

export { UIProvider, useUIContext };
