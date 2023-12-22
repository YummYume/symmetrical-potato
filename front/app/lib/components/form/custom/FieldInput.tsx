import { Grid, Text, TextField } from '@radix-ui/themes';

import type { Path } from 'react-hook-form';
import type { useRemixForm } from 'remix-hook-form';

type FormData = Record<string, unknown>;

type UseRemixForm<T extends FormData> = ReturnType<typeof useRemixForm<T>>;

export type FieldInputProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  register: UseRemixForm<T>['register'];
  error?: string;
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
  error,
  register,
  leftSlot,
  rightSlot,
  hideLabel = false,
  containerClassName = '',
  inputContainerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: FieldInputProps<T>) {
  const ariaDescribedBy = `${name}-error`;

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
          {error}
        </Text>
      )}
    </Grid>
  );
}
