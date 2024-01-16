import { Grid, Text, TextArea } from '@radix-ui/themes';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import type { Path } from 'react-hook-form';

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
  const { register, control } = useRemixFormContext<T>();

  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Controller
        name={name}
        control={control as Control<T>}
        render={({ field, fieldState: { error } }) => (
          <>
            <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
              {label}
            </Text>
            <TextArea
              {...register(field.name)}
              {...rest}
              id={field.name}
              aria-describedby={error ? ariaDescribedBy : ''}
            />
            {error?.message && (
              <Text as="p" id={ariaDescribedBy} className={errorClassName}>
                {t(error?.message, { ns: 'validators' })}
              </Text>
            )}
          </>
        )}
      />
    </Grid>
  );
}
