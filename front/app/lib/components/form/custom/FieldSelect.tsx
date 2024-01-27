import { Grid, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import type { Path } from 'react-hook-form';

type FormData = Record<string, unknown>;

type Option = { value: string; label: string };

export type FieldSelectProps<T> = {
  name: Path<T>;
  label: string;
  error?: string;
  options: Option[];
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  children?: JSX.Element;
} & React.RefAttributes<HTMLSelectElement>;

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
  const { control, register } = useRemixFormContext<T>();
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <select
              {...register(name)}
              {...rest}
              aria-describedby={error ? ariaDescribedBy : ''}
              disabled={field.disabled}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error?.message && (
              <Text as="p" id={ariaDescribedBy} className={errorClassName}>
                {t(error.message, { ns: 'validators' })}
              </Text>
            )}
          </>
        )}
      />
    </Grid>
  );
}
