import { Grid, useThemeContext } from '@radix-ui/themes';
import { useId, type ComponentProps } from 'react';
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
} & DefaultFieldProps<T> &
  ComponentProps<typeof Select>;

export function FieldMultiSelect<T extends Record<string, unknown>>({
  options,
  translationNamespace = 'common',
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
}: FieldSelectProps<T>) {
  const { t } = useTranslation();
  const { control, register } = useRemixFormContext<T>();
  const instanceId = useId();
  const { appearance } = useThemeContext();

  const isDark = appearance === 'dark';

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
          const translatedOptions = options.map((option) => {
            if (!translationNamespace) {
              return option;
            }

            return {
              ...option,
              label: t(option.label, { ns: translationNamespace }),
            };
          });

          let defaultValue: Option[] = [];

          if (field.value && Array.isArray(field.value)) {
            defaultValue = options
              .filter((o) => (field.value as Option[]).find((v) => v.value === o.value))
              .map((o) => ({
                ...o,
                label: translationNamespace ? t(o.label, { ns: translationNamespace }) : o.label,
              }));
          }

          return (
            <>
              <LabelField htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
                {label}
              </LabelField>
              <Select
                placeholder={t('select')}
                {...register(name)}
                {...rest}
                id={fieldId}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={helpId}
                aria-errormessage={errorId}
                aria-invalid={!!errorId}
                key={`field_multi_select_key_${JSON.stringify(options)}`}
                isMulti={true}
                isDisabled={field.disabled}
                options={translatedOptions}
                defaultValue={defaultValue}
                instanceId={instanceId}
                onChange={(newValue) => newValue && field.onChange(newValue)}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: 'var(--color-surface)',
                    border: 'none',
                    boxShadow: state.isFocused
                      ? 'inset 0 0 0 1px var(--gray-a8)'
                      : 'inset 0 0 0 1px var(--gray-a7)',
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: 'var(--slate-2)',
                  }),
                  multiValue: (baseStyles) => ({
                    ...baseStyles,
                    color: 'black',
                    backgroundColor: 'var(--accent-9)',
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isFocused ? 'var(--accent-9)' : 'transparent',
                    color: state.isFocused ? 'black' : 'var(--gray-12)',
                  }),
                }}
              />
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
