import { Grid, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';

import type { Control } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import type { GroupBase, Props, PropsValue } from 'react-select';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

type OptionFormat = { value: string; label: string };

export type FieldSelectProps<
  T,
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = {
  name: Path<T>;
  label: string;
  error?: string;
  options: Option[];
  isMulti?: IsMulti;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  children?: JSX.Element;
} & Props<Option, IsMulti, Group>;

export function FieldSelect<T extends FormData, B extends boolean = false>({
  name,
  label,
  options,
  isMulti,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  children,
  ...rest
}: FieldSelectProps<T, OptionFormat, B>) {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useRemixFormContext<T>();
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;

  const error = getFormErrorField(errors[name] as FormErrorField);

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Controller
        name={name}
        control={control as Control<T>}
        render={({ field }) => {
          const selectValue = () => {
            if (field.value) {
              if (isMulti && Array.isArray(field.value)) {
                return field.value.map((v) => options.find((o) => o.value === v.value));
              }
              return (
                options.find((o) => o.value === field.value) ?? {
                  value: '',
                  label: '',
                }
              );
            }
            return isNulti
              ? []
              : {
                  value: '',
                  label: '',
                };
          };
          /**const selectedValue = Array.isArray(field.value)
            ? options?.find((o) => (field.value as OptionFormat[]).find((v) => v.value === o.value))
            : options?.find((o) => o.value === field.value);**/
          return (
            <Select
              key={`field_select_key_${JSON.stringify(options)}`}
              {...register(name)}
              {...rest}
              isMulti={isMulti}
              options={options}
              value={selectedValue}
              onChange={(newValue) => newValue && field.onChange(newValue)}
            />
          );
        }}
      />
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}
