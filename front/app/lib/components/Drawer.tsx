import * as Dialog from '@radix-ui/react-dialog';
import { useContext, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { ThemeContext } from '~lib/context/Theme';

export const Drawer = ({
  children,
  container,
  close,
  description,
  position = 'left',
  title,
  trigger,
  className,
  ...rest
}: {
  children: ReactNode;
  container?: HTMLElement | null;
  close?: ReactNode;
  description?: string;
  position?: 'bottom' | 'left' | 'right' | 'top';
  title?: string;
  trigger?: ReactNode;
  className?: string;
} & React.ComponentProps<typeof Dialog.Root>) => {
  const theme = useContext(ThemeContext);

  return (
    <Dialog.Root {...rest}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal container={container ?? theme?.current}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-1 opacity-50" />
        <Dialog.Content className={twMerge(`drawer drawer--${position}`, className)}>
          {title && <Dialog.Title className="text-8 font-medium">{title}</Dialog.Title>}
          {description && <Dialog.Description>{description}</Dialog.Description>}
          {children}
          {close && (
            <Dialog.Close asChild>
              <div className="absolute right-[10px] top-[10px]">{close}</div>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
