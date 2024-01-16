import { Grid, Text, TextField } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import type { Control } from 'react-hook-form';
import type { Path } from 'react-hook-form';

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
} & React.ComponentProps<typeof TextField.Input>;

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
  const { register, control } = useRemixFormContext<T>();

  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control as Control<T>}
        render={({ field, fieldState: { error }, formState: { defaultValues } }) => {
          return (
            <>
              <TextField.Root className={inputContainerClassName}>
                {leftSlot}
                <TextField.Input
                  {...register(field.name)}
                  {...rest}
                  id={field.name}
                  aria-describedby={error ? ariaDescribedBy : ''}
                />
                {rightSlot}
              </TextField.Root>
              {error?.message && (
                <Text as="p" id={ariaDescribedBy} className={errorClassName}>
                  {t(error.message, { ns: 'validators' })}
                </Text>
              )}
            </>
          );
        }}
      />
    </Grid>
  );
}
