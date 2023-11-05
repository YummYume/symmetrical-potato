import * as ToastPrimitive from '@radix-ui/react-toast';

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
  return (
    <ToastPrimitive.Root {...props}>
      {title && <ToastPrimitive.Title>{title}</ToastPrimitive.Title>}
      <ToastPrimitive.Description>{content}</ToastPrimitive.Description>
      {children && (
        <ToastPrimitive.Action altText={altText} asChild>
          {children}
        </ToastPrimitive.Action>
      )}
      <ToastPrimitive.Close aria-label="Close">
        <span aria-hidden>×</span>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};
