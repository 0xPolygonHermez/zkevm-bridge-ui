import {
  ComponentType,
  createContext,
  FC,
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
      status: "open";
      message: Message;
    };

type ModalState =
  | {
      status: "closed";
    }
  | {
      status: "open";
      component: ComponentType;
    };

interface UIContext {
  snackbar: SnackbarState;
  openSnackbar: (message: Message) => void;
  closeSnackbar: () => void;
  modal: ModalState;
  openModal: (component: ComponentType) => void;
  closeModal: () => void;
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
  modal: { status: "closed" },
  openModal: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
  closeModal: () => {
    console.error(uiContextNotReadyErrorMsg);
  },
};

const uiContext = createContext<UIContext>(uiContextDefaultValue);

const UIProvider: FC = (props) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    status: "closed",
  });
  const [modal, setModal] = useState<ModalState>({
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

  const openModal = useCallback(
    (component: ComponentType): void =>
      setModal({
        status: "open",
        component,
      }),
    []
  );

  const closeModal = useCallback(
    (): void =>
      setModal({
        status: "closed",
      }),
    []
  );

  const value = useMemo(
    () => ({ snackbar, openSnackbar, closeSnackbar, modal, openModal, closeModal }),
    [closeModal, closeSnackbar, modal, openModal, openSnackbar, snackbar]
  );

  return <uiContext.Provider value={value} {...props} />;
};

const useUIContext = (): UIContext => {
  return useContext(uiContext);
};

export { UIProvider, useUIContext };
