import { Link as RemixLink } from '@remix-run/react';
import { clsx } from 'clsx';

import type { RemixLinkProps } from '@remix-run/react/dist/components';

export type LinkProps = {
  to: string;
  className?: string;
  unstyled?: boolean;
  children?: React.ReactNode;
} & RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement>;

export const Link = ({ to, className, unstyled = false, children, ...props }: LinkProps) => {
  return (
    <RemixLink
      to={to}
      prefetch="intent"
      className={clsx(
        {
          'rt-Text rt-reset rt-Link rt-underline-auto': !unstyled,
        },
        className,
      )}
      unstable_viewTransition
      {...props}
    >
      {children}
    </RemixLink>
  );
};
