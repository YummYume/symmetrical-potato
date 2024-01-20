import { Cross1Icon } from '@radix-ui/react-icons';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { useTranslation } from 'react-i18next';

export type BaseToastProps = {
  title?: string;
  content: string;
  altText?: string;
  children?: JSX.Element;
};

export type ToastProps = BaseToastProps & React.ComponentProps<typeof ToastPrimitive.Root>;

export const Toast = ({
  title,
  content,
  children,
  altText = 'Close this alert',
  ...props
}: ToastProps) => {
  const { t } = useTranslation();

  return (
    <ToastPrimitive.Root
      className="data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-2 bg-surface p-[15px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
      {...props}
    >
      {title && (
        <ToastPrimitive.Title className="mb-[5px] text-[15px] font-medium text-slate-12 [grid-area:_title]">
          {title}
        </ToastPrimitive.Title>
      )}
      <ToastPrimitive.Description>{content}</ToastPrimitive.Description>
      {children && (
        <ToastPrimitive.Action altText={altText} asChild>
          {children}
        </ToastPrimitive.Action>
      )}
      <ToastPrimitive.Close aria-label={t('close')}>
        <Cross1Icon width="18" height="18" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};
