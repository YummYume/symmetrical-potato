import { Grid, Text } from '@radix-ui/themes';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';

import type { Control } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import type { PropsValue } from 'react-select';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

type Option = { value: string; label: string };

export type DefaultValue = (PropsValue<Option> & (string | number | readonly string[])) | undefined;

export type FieldSelectProps<T> = {
  name: Path<T>;
  label: string;
  error?: string;
  options: Option[];
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  children?: JSX.Element;
} & React.ComponentProps<typeof Select<Option>> &
  React.SelectHTMLAttributes<HTMLSelectElement>;

export function FieldSelect<T extends FormData>({
  name,
  label,
  options,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  children,
  ...rest
}: FieldSelectProps<T>) {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useRemixFormContext<T>();
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;
  const error = getFormErrorField(errors[name] as FormErrorField);
  const registerField = register(name);

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control as Control<T>}
        render={({ field }) => (
          <Select
            {...registerField}
            {...rest}
            options={options}
            value={options.find((o) => o.value === field.value)}
            onChange={(newValue) => newValue && field.onChange(newValue.value)}
          />
        )}
      />
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}
