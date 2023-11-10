import { Link as RemixLink } from '@remix-run/react';

import type { RemixLinkProps } from '@remix-run/react/dist/components';

export type LinkProps = {
  to: string;
  children?: React.ReactNode;
} & RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement>;

export const Link = ({ to, children, ...props }: LinkProps) => {
  return (
    <RemixLink to={to} prefetch="intent" unstable_viewTransition {...props}>
      {children}
    </RemixLink>
  );
};
