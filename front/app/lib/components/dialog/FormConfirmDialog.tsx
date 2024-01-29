import { Form } from '@remix-run/react';

import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';

import type { FormAlertDialogProps } from '~/lib/components/dialog/FormAlertDialog';

export type FormConfirmDialogProps = {
  action: string;
} & FormAlertDialogProps;

export function FormConfirmDialog({
  formId,
  title,
  description,
  action,
  actionColor,
  cancelText,
  cancelColor,
  children,
  ...rest
}: FormConfirmDialogProps) {
  return (
    <>
      <Form
        id={`${formId}-form`}
        action={action}
        method="post"
        className="hidden"
        unstable_viewTransition
      />
      <FormAlertDialog
        title={title}
        description={description}
        actionColor={actionColor}
        cancelColor={cancelColor}
        cancelText={cancelText}
        formId={`${formId}-form`}
        {...rest}
      >
        {children}
      </FormAlertDialog>
    </>
  );
}
