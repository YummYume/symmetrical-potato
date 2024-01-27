import { Grid, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useRemixFormContext } from 'remix-hook-form';

import type { Path } from 'react-hook-form';

type FormData = Record<string, unknown>;

type Option = { value: string; label: string };

export type FieldSelectProps<T> = {
  name: Path<T>;
  label: string;
  error?: string;
  options: Option[];
  isDisabled?: boolean;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  children?: JSX.Element;
};

export function FieldMultiSelect<T extends FormData>({
  name,
  label,
  options,
  isDisabled = false,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  children,
  ...rest
}: FieldSelectProps<T>) {
  const { t } = useTranslation();
  const { control, register } = useRemixFormContext<T>();
  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          let defaultValue: Option[] = [];
          if (field.value && Array.isArray(field.value)) {
            defaultValue = options.filter((o) =>
              (field.value as Option[]).find((v) => v.value === o.value),
            );
          }
          return (
            <>
              <Select
                {...register(name)}
                {...rest}
                id={field.name}
                key={`field_multi_select_key_${JSON.stringify(options)}`}
                isMulti={true}
                options={options}
                defaultValue={defaultValue}
                onChange={(newValue) => newValue && field.onChange(newValue)}
                isDisabled={isDisabled}
              />
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
