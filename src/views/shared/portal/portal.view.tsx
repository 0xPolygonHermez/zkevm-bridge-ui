import { FC, PropsWithChildren, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import usePortalStyles from "src/views/shared/portal/portal.styles";

const Portal: FC<PropsWithChildren> = ({ children }) => {
  const classes = usePortalStyles();
  const portalRoot = document.querySelector("#fullscreen-modal");
  const [divElement] = useState(() => {
    const el = document.createElement("div");

    el.classList.add(classes.fullScreenModal);

    return el;
  });

  useEffect(() => {
    if (portalRoot) {
      portalRoot.appendChild(divElement);

      return () => {
        portalRoot.removeChild(divElement);
      };
    }
  }, [portalRoot, divElement]);

  return ReactDOM.createPortal(children, divElement);
};

export default Portal;
