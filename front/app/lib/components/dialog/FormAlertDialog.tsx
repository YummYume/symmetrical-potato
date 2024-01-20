import { AlertDialog as AlertDialogBase, Button, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { ComponentProps } from 'react';

export type SubmitButtonRenderProps = {
  actionColor?: ComponentProps<typeof Button>['color'];
  actionText?: string;
  formId: string;
  submitButtonProps?: ComponentProps<typeof Button>;
};

export const SubmitButton = ({
  actionColor,
  actionText,
  formId,
  submitButtonProps,
}: SubmitButtonRenderProps) => {
  const { t } = useTranslation();

  return (
    <Button type="submit" form={formId} color={actionColor} {...submitButtonProps}>
      {actionText ?? t('confirm')}
    </Button>
  );
};

export type FormAlertDialogProps = SubmitButtonRenderProps & {
  title: string;
  description: string;
  cancelText?: string;
  cancelColor?: ComponentProps<typeof Button>['color'];
  submitButtonRender?: (props: SubmitButtonRenderProps) => JSX.Element;
  children?: JSX.Element;
};

export const FormAlertDialog = ({
  title,
  description,
  formId,
  cancelText,
  actionText,
  cancelColor = 'gray',
  actionColor = 'red',
  submitButtonProps,
  submitButtonRender = SubmitButton,
  children,
}: FormAlertDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogBase.Root>
      <AlertDialogBase.Trigger>{children}</AlertDialogBase.Trigger>
      <AlertDialogBase.Content style={{ maxWidth: 450 }}>
        <AlertDialogBase.Title>{title}</AlertDialogBase.Title>
        <AlertDialogBase.Description size="2">{description}</AlertDialogBase.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialogBase.Cancel>
            <Button variant="soft" color={cancelColor}>
              {cancelText ?? t('cancel')}
            </Button>
          </AlertDialogBase.Cancel>
          <AlertDialogBase.Action>
            {submitButtonRender({
              formId,
              actionColor,
              actionText,
              submitButtonProps,
            })}
          </AlertDialogBase.Action>
        </Flex>
      </AlertDialogBase.Content>
    </AlertDialogBase.Root>
  );
};
