import { Grid, Button, Card, Flex } from '@radix-ui/themes';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import { CheckboxInput } from './CheckboxInput';
import { FieldInput } from './FieldInput';

import type { HTMLInputTypeAttribute } from 'react';
import type { ArrayPath, FieldArray } from 'react-hook-form';
import type { DefaultFieldProps } from '~/lib/types/form';

type Config<T extends Record<string, unknown>> = {
  defaultAppendValue:
    | FieldArray<T, ArrayPath<T> & (string | undefined)>
    | FieldArray<T, ArrayPath<T> & (string | undefined)>[];
  fields: {
    name: string;
    label: string;
    type: HTMLInputTypeAttribute;
  }[];
  add?: {
    text: string;
  };
  delete?: {
    text: string;
  };
};

export type FieldInputArrayProps<T extends Record<string, unknown>> = {
  /**
   * The configuration for the array of inputs.
   */
  config: Config<T>;
  /**
   * The namespace to use for translating the options' labels.
   */
  translationNamespace?: string;
  /**
   * The className to apply to the container of the input.
   */
  inputContainerClassName?: string;
  /**
   * The limit of inputs to display.
   */
  limit?: number;
} & DefaultFieldProps<T> &
  React.RefAttributes<HTMLInputElement>;

export function FieldInputArray<T extends Record<string, unknown>>({
  limit = 5,
  config,
  translationNamespace = 'common',
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
}: FieldInputArrayProps<T>) {
  const { t } = useTranslation();
  const { control } = useRemixFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  // Beware of confusion between field and fieldInput here, field is from Control
  return (
    <Grid className={containerClassName} gap="1">
      <LabelField as="span" className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </LabelField>
      <ul className="space-y-3">
        {fields.map((item, index) => {
          return (
            <li key={item.id}>
              <Card>
                <Grid gap="2">
                  {config.fields.map((fieldInput, key) => (
                    <div className="contents" key={`${item.id}-${key}`}>
                      {fieldInput.type === 'checkbox' && (
                        <CheckboxInput
                          name={`${name}.${index}.${fieldInput.name}`}
                          label={`${fieldInput.label} ${index + 1}`}
                          hideLabel={hideLabel}
                          hideError={hideError}
                          disabled={disabled}
                          required={required}
                          labelRender={LabelField}
                          helpRender={HelpField}
                          errorRender={ErrorField}
                        />
                      )}
                      {fieldInput.type !== 'checkbox' && (
                        <FieldInput
                          name={`${name}.${index}.${fieldInput.name}`}
                          label={`${fieldInput.label} ${index + 1}`}
                          type={fieldInput.type}
                          hideLabel={hideLabel}
                          hideError={hideError}
                          disabled={disabled}
                          required={required}
                          labelRender={LabelField}
                          helpRender={HelpField}
                          errorRender={ErrorField}
                          inputContainerClassName={inputContainerClassName}
                          {...rest}
                        />
                      )}
                    </div>
                  ))}

                  {!disabled && (
                    <Flex justify="end" align="center" gap="2">
                      <Button
                        type="button"
                        className="w-fit"
                        color="crimson"
                        onClick={() => remove(index)}
                      >
                        {config.delete?.text ?? t('delete', { ns: translationNamespace })}
                      </Button>
                    </Flex>
                  )}
                </Grid>
              </Card>
            </li>
          );
        })}
        {fields.length < limit && !disabled && (
          <Button
            type="button"
            onClick={() => append(config.defaultAppendValue)}
            disabled={disabled}
          >
            {config.add?.text ?? t('add', { ns: translationNamespace })}
          </Button>
        )}
      </ul>
    </Grid>
  );
}
