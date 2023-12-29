import {
  Link as RemixLink,
  NavLink as RemixNavLink,
  type LinkProps as RemixLinkProps,
  type NavLinkProps as RemixNavLinkProps,
} from '@remix-run/react';
import { clsx } from 'clsx';
import { Children, cloneElement, isValidElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type LinkProps = {
  /**
   * The path to link to.
   */
  to: string;
  /**
   * The class name to apply to the link element.
   */
  className?: string;
  /**
   * Whether to add default classes to the link element or not.
   */
  unstyled?: boolean;
  children?: React.ReactElement | React.ReactNode;
} & RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement>;

export type NavLinkRenderProps = {
  isActive: boolean;
  isPending: boolean;
  isTransitioning: boolean;
};

export type NavLinkProps = {
  /**
   * The path to link to.
   */
  to: string;
  /**
   * The class name to apply to the link element.
   */
  className?: string;
  /**
   * The class name to apply to the link element when it is active.
   */
  activeClassName?: string;
  /**
   * The class name to apply to the link element when it is pending.
   */
  pendingClassName?: string;
  /**
   * The class name to apply to the link element when it is transitioning.
   */
  transitioningClassName?: string;
  /**
   * Whether to add default classes to the link element or not.
   */
  unstyled?: boolean;
  children?: React.ReactNode | ((props: NavLinkRenderProps) => React.ReactNode);
} & RemixNavLinkProps &
  React.RefAttributes<HTMLAnchorElement>;

/**
 * A wrapper around Remix's Link component that adds some default classes and uses view transitions.
 */
export const Link = ({ to, className, unstyled = false, children, ...props }: LinkProps) => {
  return (
    <RemixLink
      to={to}
      prefetch="intent"
      className={twMerge(
        clsx({
          'rt-Text rt-reset rt-Link relative': !unstyled,
        }),
        className,
      )}
      unstable_viewTransition
      {...props}
    >
      {children}
    </RemixLink>
  );
};

export const NavLinkActiveIndicator = ({
  isActive,
  isPending,
  className,
  viewTransitionName = 'active-link',
}: {
  isActive: boolean;
  isPending: boolean;
  className?: string;
  viewTransitionName?: string;
}) => (
  <div
    className={twMerge(
      clsx('absolute inset-x-0 -bottom-0.5 h-0.5 rounded-1', {
        'bg-accent-8': isActive,
        'bg-accent-10 opacity-50': isPending,
      }),
      className,
    )}
    aria-hidden="true"
    style={{ viewTransitionName: isActive ? viewTransitionName : undefined }}
  />
);

/**
 * A wrapper around Remix's NavLink component that adds some default classes and uses view transitions.
 */
export const NavLink = ({
  to,
  className,
  activeClassName,
  pendingClassName,
  transitioningClassName,
  unstyled = false,
  children,
  ...props
}: NavLinkProps) => {
  return (
    <RemixNavLink
      to={to}
      prefetch="intent"
      className={({ isActive, isPending, isTransitioning }) => {
        return twMerge(
          clsx(
            {
              'rt-Text rt-reset rt-Link relative': !unstyled,
            },
            isActive ? activeClassName : undefined,
            isPending ? pendingClassName : undefined,
            isTransitioning ? transitioningClassName : undefined,
          ),
          className,
        );
      }}
      unstable_viewTransition
      {...props}
    >
      {({ isActive, isPending, isTransitioning }) => {
        if (typeof children === 'function') {
          const childrenElements = children({ isActive, isPending, isTransitioning });

          return Children.map(childrenElements, (child) =>
            isValidElement<NavLinkRenderProps>(child)
              ? cloneElement(child, { isActive, isPending, isTransitioning })
              : child,
          );
        }

        return children;
      }}
    </RemixNavLink>
  );
};
