import { Grid, Select as RadixSelect, Text } from '@radix-ui/themes';

export type SelectProps = {
  name: string;
  label: string;
  error?: string;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  triggerProps?: React.ComponentProps<typeof RadixSelect.Trigger> &
    React.RefAttributes<HTMLButtonElement>;
  children?: JSX.Element;
} & React.ComponentProps<typeof RadixSelect.Root> &
  React.RefAttributes<HTMLDivElement>;

export const Select = ({
  name,
  label,
  error,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  triggerProps = {},
  children,
  ...rest
}: SelectProps) => {
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <RadixSelect.Root name={name} {...rest}>
        <RadixSelect.Trigger
          aria-labelledby={ariaLabelledBy}
          aria-describedby={error ? ariaDescribedBy : undefined}
          {...triggerProps}
        />
        {children}
      </RadixSelect.Root>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {error}
        </Text>
      )}
    </Grid>
  );
};
