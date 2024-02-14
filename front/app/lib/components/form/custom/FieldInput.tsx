import { Grid, TextField } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import type { DefaultFieldProps } from '~/lib/types/form';

export type FieldInputProps<T extends Record<string, unknown>> = {
  /**
   * Content to include in the left side of the input.
   */
  leftSlot?: JSX.Element;
  /**
   * Content to include in the right side of the input.
   */
  rightSlot?: JSX.Element;
  /**
   * The className to apply to the container of the input.
   */
  inputContainerClassName?: string;
} & DefaultFieldProps<T> &
  React.ComponentProps<typeof TextField.Input>;

export function FieldInput<T extends Record<string, unknown>>({
  leftSlot,
  rightSlot,
  inputContainerClassName = '',
  name,
  label,
  id,
  hideLabel = false,
  hideError = false,
  disabled = undefined,
  required = undefined,
  help = undefined,
  containerClassName = '',
  labelRender: LabelField = Label,
  helpRender: HelpField = Help,
  errorRender: ErrorField = Error,
  ...rest
}: FieldInputProps<T>) {
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
          const defaultValue =
            typeof field.value === 'string' || typeof field.value === 'number'
              ? field.value
              : undefined;

          return (
            <>
              <LabelField htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
                {label}
              </LabelField>
              <TextField.Root className={inputContainerClassName}>
                {leftSlot}
                <TextField.Input
                  {...register(field.name)}
                  {...rest}
                  id={fieldId}
                  aria-describedby={helpId}
                  aria-errormessage={errorId}
                  aria-invalid={!!errorId}
                  defaultValue={defaultValue}
                  disabled={field.disabled}
                  required={required}
                  color={errorId ? 'ruby' : rest.color}
                />
                {rightSlot}
              </TextField.Root>
              {error?.message && !hideError && (
                <ErrorField id={errorId}>{t(error.message, { ns: 'validators' })}</ErrorField>
              )}
              {help && <HelpField id={helpId}>{help}</HelpField>}
            </>
          );
        }}
      />
    </Grid>
  );
}
