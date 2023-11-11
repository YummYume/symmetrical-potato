import { Text, TextField } from '@radix-ui/themes';
import cn from 'classnames';

export type FieldInputProps = {
  name: string;
  label: string;
  error?: string;
  leftSlot?: JSX.Element;
  rightSlot?: JSX.Element;
  hideLabel?: boolean;
  containerClassName?: string;
  inputContainerClassName?: string;
  errorClassName?: string;
} & React.ComponentProps<typeof TextField.Input> &
  React.RefAttributes<HTMLInputElement>;

export const FieldInput = ({
  name,
  label,
  error,
  leftSlot,
  rightSlot,
  hideLabel = false,
  containerClassName = '',
  inputContainerClassName = '',
  errorClassName = 'text-accent-6',
  ...rest
}: FieldInputProps) => {
  const ariaDescribedBy = `${name}-error`;

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      <Text as="label" htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <TextField.Root className={inputContainerClassName}>
        {leftSlot && leftSlot}
        <TextField.Input id={name} name={name} aria-describedby={ariaDescribedBy} {...rest} />
        {rightSlot && rightSlot}
      </TextField.Root>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {error}
        </Text>
      )}
    </div>
  );
};
