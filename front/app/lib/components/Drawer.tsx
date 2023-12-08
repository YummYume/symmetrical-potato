import * as Dialog from '@radix-ui/react-dialog';
import { useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { ThemeContext } from '~lib/context/Theme';

export const Drawer = ({
  children,
  container,
  close,
  description,
  onClose,
  open = false,
  position = 'left',
  setOpen,
  title,
  trigger,
}: {
  children: ReactNode;
  container?: HTMLElement | null;
  close?: ReactNode;
  description?: string;
  onClose?: () => void;
  open?: boolean;
  position?: 'bottom' | 'left' | 'right' | 'top';
  setOpen?: Dispatch<SetStateAction<boolean>>;
  title?: string;
  trigger?: ReactNode;
}) => {
  const theme = useContext(ThemeContext);

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal container={container ?? theme?.current}>
        <div className={`rt-DialogOverlay drawer--${position} | !absolute !p-0 after:opacity-0`}>
          <Dialog.Content
            className="rt-DialogContent rt-r-size-3"
            onPointerDownOutside={() => {
              if (setOpen) {
                setOpen(false);
              }

              if (onClose) {
                onClose();
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
