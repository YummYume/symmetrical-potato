import { Grid, Text, TextArea } from '@radix-ui/themes';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';
import { toString } from '~/lib/utils/form';

import type { Path } from 'react-hook-form';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

export type TextAreaInputProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof TextArea>;

export function TextAreaInput<T extends FormData>({
  name,
  label,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: TextAreaInputProps<T>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useRemixFormContext<T>();
  const ariaDescribedBy = `${name}-error`;
  const error = getFormErrorField(errors[name] as FormErrorField);

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control as Control<T>}
        render={({ field }) => (
          <TextArea
            {...register(name)}
            {...rest}
            id={name}
            aria-describedby={error ? ariaDescribedBy : ''}
            disabled={field.disabled}
            defaultValue={toString(field.value)}
            onChange={field.onChange}
            onBlur={field.onBlur}
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
