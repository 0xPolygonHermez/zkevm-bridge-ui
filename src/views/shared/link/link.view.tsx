import { FC, PropsWithChildren } from "react";

import { useLinkStyles } from "src/views/shared/link/link.styles";

interface LinkProps {
  href: string;
}

export const Link: FC<PropsWithChildren<LinkProps>> = ({ children, href }) => {
  const classes = useLinkStyles();

  return (
    <a className={classes.link} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
};
