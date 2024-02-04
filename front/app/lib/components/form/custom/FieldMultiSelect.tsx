import { Grid } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
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
} & DefaultFieldProps<T>;

export function FieldMultiSelect<T extends Record<string, unknown>>({
  options,
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
  const { control, register } = useRemixFormContext<T>();

  return (
    <Grid className={containerClassName} gap="1">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const fieldId = id ?? field.name;
          const ariaLabelledBy = `${fieldId}-label`;
          const helpId = help ? `${fieldId}-help` : undefined;
          const errorId = error?.message ? `${fieldId}-error` : undefined;
          let defaultValue: Option[] = [];
          if (field.value && Array.isArray(field.value)) {
            defaultValue = options.filter((o) =>
              (field.value as Option[]).find((v) => v.value === o.value),
            );
          }
          return (
            <>
              <LabelField htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
                {label}
              </LabelField>
              <Select
                {...register(name)}
                {...rest}
                id={fieldId}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={helpId}
                aria-errormessage={errorId}
                aria-invalid={!!errorId}
                key={`field_multi_select_key_${JSON.stringify(options)}`}
                isMulti={true}
                isDisabled={disabled}
                options={options}
                defaultValue={defaultValue}
                onChange={(newValue) => newValue && field.onChange(newValue)}
              />
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
