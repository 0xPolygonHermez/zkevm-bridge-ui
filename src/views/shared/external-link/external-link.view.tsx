import { FC, PropsWithChildren } from "react";

import { useExternalLinkStyles } from "src/views/shared/external-link/external-link.styles";

interface ExternalLinkProps {
  href: string;
}

export const ExternalLink: FC<PropsWithChildren<ExternalLinkProps>> = ({ children, href }) => {
  const classes = useExternalLinkStyles();

  return (
    <a className={classes.link} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
};
