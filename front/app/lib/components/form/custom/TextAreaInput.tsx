import { Grid, Text, TextArea } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';

import type { Path } from 'react-hook-form';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

export type TextAreaInputProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
  inputContainerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof TextArea> &
  React.RefAttributes<HTMLInputElement>;

export function TextAreaInput<T extends FormData>({
  name,
  label,
  hideLabel = false,
  containerClassName = '',
  inputContainerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: TextAreaInputProps<T>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useRemixFormContext<T>();

  const ariaDescribedBy = `${name}-error`;

  const error = getFormErrorField(errors[name] as FormErrorField);

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <TextArea
        id={name}
        aria-describedby={error ? ariaDescribedBy : ''}
        className={inputContainerClassName}
        {...register(name)}
        {...rest}
      />
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}
