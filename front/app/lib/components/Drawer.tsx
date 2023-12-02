import * as Dialog from '@radix-ui/react-dialog';
import { useContext, type ReactNode } from 'react';

import { ThemeContext } from '~lib/context/Theme';

export const Drawer = ({
  children,
  container,
  closeOnClickOutside = true,
  close,
  description,
  position = 'left',
  title,
  trigger,
}: {
  children: ReactNode;
  container?: HTMLElement | null;
  closeOnClickOutside?: boolean;
  close?: ReactNode;
  description?: string;
  position?: 'bottom' | 'left' | 'right' | 'top';
  title?: string;
  trigger?: ReactNode;
}) => {
  const theme = useContext(ThemeContext);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal container={container ?? theme?.current}>
        <div
          className={`rt-DialogOverlay drawer--${position} | z-10 !p-0 ${
            !closeOnClickOutside ? '!left-auto' : ''
          }`}
        >
          <Dialog.Content
            className="rt-DialogContent rt-r-size-3"
            onPointerDownOutside={(e) => {
              if (!closeOnClickOutside) {
                e.preventDefault();
              }
            }}
          >
            {title && <Dialog.Title className="text-8 font-medium">{title}</Dialog.Title>}
            {description && <Dialog.Description>{description}</Dialog.Description>}
            {children}
            {close && (
              <Dialog.Close asChild>
                <div className="absolute right-[10px] top-[10px]">{close}</div>
              </Dialog.Close>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
