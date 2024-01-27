import { Form } from '@remix-run/react';
import { type ComponentProps } from 'react';

import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';

import type { Button } from '@radix-ui/themes';

export type FormConfirmDialogProps = {
  idForm: string;
  title: string;
  description: string;
  action: string;
  actionColor?: ComponentProps<typeof Button>['color'];
  cancelText?: string;
  cancelColor?: ComponentProps<typeof Button>['color'];
  children?: JSX.Element;
};

export function FormConfirmDialog({
  idForm,
  title,
  description,
  action,
  actionColor,
  cancelText,
  cancelColor,
  children,
}: FormConfirmDialogProps) {
  return (
    <>
      <Form
        id={`${idForm}-form`}
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
        formId={`${idForm}-form`}
      >
        {children}
      </FormAlertDialog>
    </>
  );
}
