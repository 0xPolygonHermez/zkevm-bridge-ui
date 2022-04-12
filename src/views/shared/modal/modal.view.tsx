import { ComponentType } from "react";
import useModalStyles from "src/views/shared/modal/modal.styles";

interface ModalProps {
  component: ComponentType;
  onClose: () => void;
}

function Modal({ component: Component, onClose }: ModalProps): JSX.Element {
  const classes = useModalStyles();
  const onClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };
  return (
    <div className={classes.background} onClick={onClick}>
      <Component />
    </div>
  );
}

export default Modal;
