import { Grid } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRemixFormContext } from 'remix-hook-form';

import { Rating, type RatingProps } from '~/lib/components/Rating';
import { Error } from '~/lib/components/form/fields/Error';
import { Help } from '~/lib/components/form/fields/Help';
import { Label } from '~/lib/components/form/fields/Label';

import type { DefaultFieldProps } from '~/lib/types/form';

export type FieldRatingProps<T extends Record<string, unknown>> = {
  /**
   * The className to apply to the container of the input.
   */
  inputContainerClassName?: string;
} & DefaultFieldProps<T> &
  Omit<RatingProps, 'value'>;

export function FieldRating<T extends Record<string, unknown>>({
  name,
  label,
  id,
  hideLabel = false,
  hideError = false,
  disabled = undefined,
  required = undefined,
  help = undefined,
  readOnly = false,
  containerClassName = '',
  labelRender: LabelField = Label,
  helpRender: HelpField = Help,
  errorRender: ErrorField = Error,
  ...rest
}: FieldRatingProps<T>) {
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
          const defaultValue = (
            typeof field.value === 'number' ? field.value : undefined
          ) as number;
          return (
            <>
              <LabelField htmlFor={fieldId} className={hideLabel ? 'sr-only' : undefined}>
                {label}
              </LabelField>
              <Rating
                {...register(name)}
                {...rest}
                id={fieldId}
                // ref={field.ref}
                aria-describedby={helpId}
                aria-errormessage={errorId}
                aria-invalid={!!errorId}
                value={defaultValue > 0 ? defaultValue : 1}
                isRequired={required}
                isDisabled={field.disabled}
                readOnly={readOnly}
                onChange={field.onChange}
                visibleLabelId={label}
                onBlur={field.onBlur}
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
