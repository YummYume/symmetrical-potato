import { Grid, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

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

  const error = (errors[name]?.message ? errors[name]?.message : null) as string | null;

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
