import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Card, Grid, IconButton } from '@radix-ui/themes';
import { useFieldArray } from 'react-hook-form';
import { useRemixFormContext } from 'remix-hook-form';

import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import { CheckboxInput } from './CheckboxInput';
import { FieldInput } from './FieldInput';
import { FieldSelect } from './FieldSelect';

import type { HTMLInputTypeAttribute } from 'react';
import type { ArrayPath, FieldArray } from 'react-hook-form';
import type { DefaultFieldProps } from '~/lib/types/form';
import type { Option } from '~/lib/types/select';

type Field =
  | {
      name: string;
      label: string;
      type: 'select';
      options: Option[];
    }
  | {
      name: string;
      label: string;
      type: HTMLInputTypeAttribute;
    };

type Config<T extends Record<string, unknown>> = {
  defaultAppendValue:
    | FieldArray<T, ArrayPath<T> & (string | undefined)>
    | FieldArray<T, ArrayPath<T> & (string | undefined)>[];
  fields: Field[];
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
      <ul className="grid gap-2">
        {fields.map((item, index) => {
          return (
            <li key={item.id}>
              <Card>
                {!disabled && (
                  <div className="text-right">
                    <IconButton color="ruby" onClick={() => remove(index)} type="button">
                      <TrashIcon />
                    </IconButton>
                  </div>
                )}
                <Grid gap="2">
                  {config.fields.map((fieldInput, key) => (
                    <div className="contents" key={`${item.id}-${key}`}>
                      {fieldInput.type === 'select' && 'options' in fieldInput && (
                        <FieldSelect
                          name={`${name}.${index}.${fieldInput.name}`}
                          label={`${fieldInput.label} ${index + 1}`}
                          options={fieldInput.options}
                          hideLabel={hideLabel}
                          hideError={hideError}
                          disabled={disabled}
                          required={required}
                          labelRender={LabelField}
                          helpRender={HelpField}
                          errorRender={ErrorField}
                        />
                      )}
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
                      {!['checkbox', 'select'].includes(fieldInput.type) && (
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
                </Grid>
              </Card>
            </li>
          );
        })}
        {fields.length < limit && !disabled && (
          <IconButton
            disabled={disabled}
            onClick={() => append(config.defaultAppendValue)}
            type="button"
            className="!w-full"
          >
            <PlusIcon />
          </IconButton>
        )}
      </ul>
    </Grid>
  );
}
