import { FC } from "react";

import useLayoutStyles from "src/views/core/layout/layout.styles";

const Layout: FC = ({ children }) => {
  const classes = useLayoutStyles();

  return (
    <div className={classes.layout}>
      <div className={classes.container}>{children}</div>
    </div>
  );
};

export default Layout;
