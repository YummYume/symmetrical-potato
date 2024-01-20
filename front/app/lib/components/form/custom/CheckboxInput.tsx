import { Flex, Grid, Text } from '@radix-ui/themes';
import { Checkbox } from '@radix-ui/themes';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { getFormErrorField } from '~/lib/utils/error';

import type { Path } from 'react-hook-form';
import type { FormErrorField } from '~/lib/utils/error';

type FormData = Record<string, unknown>;

export type CheckboxProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
  textProps?: React.ComponentPropsWithRef<typeof Text>;
  checkboxContainerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof Checkbox> &
  React.RefAttributes<HTMLInputElement>;

export function CheckboxInput<T extends FormData>({
  name,
  label,
  hideLabel = false,
  containerClassName = '',
  textProps = {
    as: 'label',
    size: '3',
  },
  checkboxContainerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: CheckboxProps<T>) {
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
      <Text {...textProps}>
        <Flex gap="2" className={checkboxContainerClassName}>
          <Controller
            name={name}
            control={control as Control<T>}
            render={({ field }) => (
              <Checkbox
                {...register(name)}
                {...rest}
                id={name}
                aria-describedby={error ? ariaDescribedBy : ''}
                disabled={field.disabled}
                value="true"
                defaultChecked={!!field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
        </Flex>
      </Text>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {t(error, { ns: 'validators' })}
        </Text>
      )}
    </Grid>
  );
}
