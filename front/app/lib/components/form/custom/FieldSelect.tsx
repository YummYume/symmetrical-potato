import { Grid, Text } from '@radix-ui/themes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';

import type { Select } from '@radix-ui/themes';
import type { Path } from 'react-hook-form';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

export type FieldSelectProps<T> = {
  name: Path<T>;
  label: string;
  error?: string;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  triggerProps?: React.ComponentProps<typeof Select.Trigger> &
    React.RefAttributes<HTMLButtonElement>;
  children?: JSX.Element;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function FieldSelectInner<T extends FormData>(
  {
    name,
    label,
    hideLabel = false,
    containerClassName = '',
    errorClassName = 'text-accent-6',
    triggerProps = {},
    children,
    ...rest
  }: FieldSelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<T>();
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;
  const error = getFormErrorField(errors[name] as FormErrorField);
  const field = register(name);

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <select {...field} {...rest}>
        {children}
      </select>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}

export const FieldSelect = React.forwardRef(FieldSelectInner);
