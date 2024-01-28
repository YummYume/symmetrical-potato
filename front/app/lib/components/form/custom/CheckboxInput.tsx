import { Flex, Grid, Text } from '@radix-ui/themes';
import { Checkbox } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import type { PropsWithoutRefOrColor } from '@radix-ui/themes';
import type { DefaultFieldProps } from '~/lib/types/form';

export type CheckboxProps<T extends Record<string, unknown>> = {
  textProps?: Omit<PropsWithoutRefOrColor<'label'>, 'as'>;
  checkboxContainerClassName?: string;
} & DefaultFieldProps<T> &
  React.ComponentProps<typeof Checkbox> &
  React.RefAttributes<HTMLInputElement>;

export function CheckboxInput<T extends Record<string, unknown>>({
  textProps = {},
  checkboxContainerClassName = '',
  name,
  label,
  id,
  hideLabel = false,
  disabled = undefined,
  required = undefined,
  help = undefined,
  containerClassName = '',
  labelRender: LabelField = Label,
  helpRender: HelpField = Help,
  errorRender: ErrorField = Error,
  ...rest
}: CheckboxProps<T>) {
  const { t } = useTranslation();
  const { register, control } = useRemixFormContext<T>();

  return (
    <Grid className={containerClassName} gap="1">
      <Controller
        name={name}
        disabled={disabled}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const fieldId = id ?? field.name;
          const helpId = help ? `${fieldId}-help` : undefined;
          const errorId = error?.message ? `${fieldId}-error` : undefined;

          return (
            <>
              <Text {...textProps} as="label" size="3">
                <Flex gap="2" className={checkboxContainerClassName}>
                  <Checkbox
                    {...register(field.name)}
                    {...rest}
                    value={rest.value ?? 'true'}
                    defaultChecked={!!field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    id={fieldId}
                    aria-describedby={helpId}
                    aria-errormessage={errorId}
                    aria-invalid={!!errorId}
                    disabled={field.disabled}
                    required={required}
                    color={errorId ? 'crimson' : rest.color}
                  />
                  <LabelField as="span" className={hideLabel ? 'sr-only' : undefined}>
                    {label}
                  </LabelField>
                </Flex>
              </Text>
              {help && <HelpField id={helpId}>{help}</HelpField>}
              {error?.message && (
                <ErrorField id={errorId}>{t(error.message, { ns: 'validators' })}</ErrorField>
              )}
            </>
          );
        }}
      />
    </Grid>
  );
}
