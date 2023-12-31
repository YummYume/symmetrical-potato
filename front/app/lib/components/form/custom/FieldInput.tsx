import { Grid, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';
import { extractIndex } from '~/lib/utils/tools';

import type { Path } from 'react-hook-form';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

export type FieldInputProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  leftSlot?: JSX.Element;
  rightSlot?: JSX.Element;
  hideLabel?: boolean;
  containerClassName?: string;
  inputContainerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof TextField.Input> &
  React.RefAttributes<HTMLInputElement>;

export function FieldInput<T extends FormData>({
  name,
  label,
  leftSlot,
  rightSlot,
  hideLabel = false,
  containerClassName = '',
  inputContainerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: FieldInputProps<T>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<T>();

  const ariaDescribedBy = `${name}-error`;

  let error: string | null = null;

  // Check if the field is a multi field (e.g. name[0].firstName) or a single field (e.g. name), before accessing the error
  if (errors) {
    const nameSplit = name.split('[');

    if (nameSplit.length > 1) {
      const parentFieldName = nameSplit[0];
      const errorParentField = errors[parentFieldName];
      const index = extractIndex(name);
      const property = nameSplit[1].split('.')[1];

      if (errorParentField !== undefined && index !== null && property !== undefined) {
        if (Array.isArray(errorParentField) && errorParentField[index] !== undefined) {
          error = getFormErrorField(errorParentField[index][property] as FormErrorField);
        }
      }
    } else {
      error = getFormErrorField(errors[name] as FormErrorField);
    }
  }

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <TextField.Root className={inputContainerClassName}>
        {leftSlot}
        <TextField.Input
          id={name}
          aria-describedby={error ? ariaDescribedBy : ''}
          {...register(name)}
          {...rest}
        />
        {rightSlot}
      </TextField.Root>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}
