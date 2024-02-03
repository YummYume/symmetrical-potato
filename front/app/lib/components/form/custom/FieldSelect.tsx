import { Grid, Select } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import type { DefaultFieldProps } from '~/lib/types/form';
import type { Option } from '~/lib/types/select';

export type FieldSelectProps<T extends Record<string, unknown>> = {
  /**
   * The options to display in the select.
   */
  options: Option[];
  /**
   * The namespace to use for translating the options' labels.
   */
  translationNamespace?: string;
} & DefaultFieldProps<T> &
  React.ComponentProps<typeof Select.Trigger>;

export function FieldSelect<T extends Record<string, unknown>>({
  options,
  translationNamespace = 'common',
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
}: FieldSelectProps<T>) {
  const { t } = useTranslation();
  const { control } = useRemixFormContext<T>();

  return (
    <Grid className={containerClassName} gap="1">
      <Controller
        name={name}
        disabled={disabled}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const fieldId = id ?? field.name;
          const ariaLabelledBy = `${fieldId}-label`;
          const helpId = help ? `${fieldId}-help` : undefined;
          const errorId = error?.message ? `${fieldId}-error` : undefined;
          const defaultValue = typeof field.value === 'string' ? field.value : undefined;

          return (
            <>
              <LabelField id={ariaLabelledBy} className={hideLabel ? 'sr-only' : undefined}>
                {label}
              </LabelField>
              <Select.Root
                name={field.name}
                defaultValue={defaultValue}
                disabled={field.disabled}
                required={required}
                onValueChange={field.onChange}
                onOpenChange={field.onBlur}
              >
                <Select.Trigger
                  {...rest}
                  id={fieldId}
                  aria-labelledby={ariaLabelledBy}
                  aria-describedby={helpId}
                  aria-errormessage={errorId}
                  aria-invalid={!!errorId}
                  color={errorId ? 'crimson' : rest.color}
                />
                <Select.Content>
                  {options.map((option) => (
                    <Select.Item key={option.value} value={option.value} disabled={option.disabled}>
                      {translationNamespace
                        ? t(option.label, { ns: translationNamespace })
                        : option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {error?.message && (
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
