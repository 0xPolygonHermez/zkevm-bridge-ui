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

interface GlobalContext {
  snackbar: SnackbarState;
  openSnackbar: (message: Message) => void;
  closeSnackbar: () => void;
  modal: ModalState;
  openModal: (component: ComponentType) => void;
  closeModal: () => void;
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
  modal: { status: "closed" },
  openModal: () => {
    console.error(globalContextNotReadyErrorMsg);
  },
  closeModal: () => {
    console.error(globalContextNotReadyErrorMsg);
  },
};

const globalContext = createContext<GlobalContext>(globalContextDefaultValue);

const GlobalProvider: FC = (props) => {
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

  return <globalContext.Provider value={value} {...props} />;
};

const useGlobalContext = (): GlobalContext => {
  return useContext(globalContext);
};

export { GlobalProvider, useGlobalContext };
