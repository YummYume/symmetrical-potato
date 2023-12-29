import { AlertDialog as AlertDialogBase, Button, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { ComponentProps } from 'react';

export type FormAlertDialogProps = {
  title: string;
  description: string;
  formId: string;
  cancelText?: string;
  actionText?: string;
  cancelColor?: ComponentProps<typeof Button>['color'];
  actionColor?: ComponentProps<typeof Button>['color'];
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
            <Button variant="solid" color={actionColor} type="submit" form={formId}>
              {actionText ?? t('confirm')}
            </Button>
          </AlertDialogBase.Action>
        </Flex>
      </AlertDialogBase.Content>
    </AlertDialogBase.Root>
  );
};
