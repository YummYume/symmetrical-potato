import { Grid, Text, Button } from '@radix-ui/themes';
import { TextField } from '@radix-ui/themes';
import { useFieldArray, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import type { HTMLInputTypeAttribute } from 'react';
import type { ArrayPath, FieldArray, Path } from 'react-hook-form';

type FormData = Record<string, unknown>;

type Config<T extends FormData> = {
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

export type FieldInputArrayProps<T extends FormData> = {
  name: Path<T>;
  label: string;
  config: Config<T>;
  hideLabel?: boolean;
  containerClassName?: string;
  inputContainerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof TextField.Input>;

export function FieldInputArray<T extends FormData>({
  name,
  label,
  config,
  hideLabel = false,
  containerClassName = '',
  inputContainerClassName = '',
  errorClassName = 'text-accent-6',
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
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <Text
                          as="label"
                          htmlFor={field.name}
                          className={hideLabel ? 'sr-only' : ''}
                        >
                          {`${fieldInput.label} ${key + 1}`}
                        </Text>

                        <TextField.Root className={inputContainerClassName}>
                          <TextField.Input
                            {...register(field.name)}
                            {...rest}
                            id={field.name}
                            aria-describedby={error ? `${field.name}-error` : ''}
                            type={fieldInput.type}
                          />
                        </TextField.Root>

                        {error?.message && (
                          <Text as="p" id={`${field.name}-error`} className={errorClassName}>
                            {t(error.message, { ns: 'validators' })}
                          </Text>
                        )}
                      </>
                    )}
                    name={`${name}.${index}.${fieldInput.name}` as Path<T>}
                    control={control}
                  />
                ))}

                <Button type="button" color="crimson" onClick={() => remove(index)}>
                  {config.delete?.text ?? t('delete', { ns: 'common' })}
                </Button>
              </Grid>
            </li>
          );
        })}
        <Button type="button" onClick={() => append(config.defaultAppendValue)}>
          {config.add?.text ?? t('add', { ns: 'common' })}
        </Button>
      </ul>
    </Grid>
  );
}
