import { Grid, Text, Button } from '@radix-ui/themes';
import { TextField } from '@radix-ui/themes';
import { useFieldArray, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import type { HTMLInputTypeAttribute } from 'react';
import type { ArrayPath, FieldArray, Path } from 'react-hook-form';
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
} & DefaultFieldProps<T> &
  React.ComponentProps<typeof TextField.Input>;

export function FieldInputArray<T extends Record<string, unknown>>({
  config,
  translationNamespace = 'common',
  inputContainerClassName = '',
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
}: FieldInputArrayProps<T>) {
  const { t } = useTranslation();
  const { register, control } = useRemixFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  // Beware of confusion between field and fieldInput here, field is from Control
  return (
    <Grid className={containerClassName} gap="1">
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <ul>
        {fields.map((item, index) => {
          return (
            <li key={item.id} className="mb-2">
              <Grid>
                {config.fields.map((fieldInput, key) => (
                  <Controller
                    key={`${item.id}-${key}`}
                    name={`${name}.${index}.${fieldInput.name}` as Path<T>}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const fieldId = id ?? field.name;
                      const helpId = help ? `${fieldId}-help` : undefined;
                      const errorId = error?.message ? `${fieldId}-error` : undefined;
                      return (
                        <>
                          <LabelField
                            htmlFor={fieldId}
                            className={hideLabel ? 'sr-only' : undefined}
                          >
                            {`${fieldInput.label} ${index + 1}`}
                          </LabelField>

                          <TextField.Root className={inputContainerClassName}>
                            <TextField.Input
                              {...register(field.name)}
                              {...rest}
                              id={fieldId}
                              aria-describedby={helpId}
                              aria-errormessage={errorId}
                              aria-invalid={!!errorId}
                              color={errorId ? 'crimson' : rest.color}
                              type={fieldInput.type}
                            />
                          </TextField.Root>

                          {error?.message && (
                            <ErrorField id={errorId}>
                              {t(error.message, { ns: 'validators' })}
                            </ErrorField>
                          )}
                          {help && <HelpField id={helpId}>{help}</HelpField>}
                        </>
                      );
                    }}
                  />
                ))}

                <Button type="button" color="crimson" onClick={() => remove(index)}>
                  {config.delete?.text ?? t('delete', { ns: translationNamespace })}
                </Button>
              </Grid>
            </li>
          );
        })}
        <Button type="button" onClick={() => append(config.defaultAppendValue)}>
          {config.add?.text ?? t('add', { ns: translationNamespace })}
        </Button>
      </ul>
    </Grid>
  );
}
