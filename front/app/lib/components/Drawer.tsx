import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
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
  const contentClassName = clsx(
    'absolute z-50 overflow-y-auto bg-mauve-4 p-6 shadow-4 animate-duration-300 scrollbar-thin scrollbar-track-mauve-10 scrollbar-thumb-accent-5 scrollbar-track-rounded-4 scrollbar-thumb-rounded-4 motion-reduce:animate-none',
    position === 'left' &&
      'left-0 top-0 h-full w-50 radix-state-closed:animate-fade-right radix-state-closed:animate-reverse radix-state-open:animate-fade-right',
    position === 'right' &&
      'right-0 top-0 h-full w-50 radix-state-closed:animate-fade-left radix-state-closed:animate-reverse radix-state-open:animate-fade-left',
    position === 'top' &&
      'top-0 left-0 w-full h-full radix-state-closed:animate-fade-down radix-state-closed:animate-reverse radix-state-open:animate-fade-down',
    position === 'bottom' &&
      'bottom-0 left-0 w-full h-full radix-state-closed:animate-fade-up radix-state-closed:animate-reverse radix-state-open:animate-fade-up',
  );

  return (
    <Dialog.Root {...rest}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal container={container ?? theme?.current}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-1 opacity-50" />
        <Dialog.Content className={twMerge(contentClassName, className)}>
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
