import { Grid, Select, Text } from '@radix-ui/themes';
import cn from 'classnames';

export type FieldSelectProps = {
  name: string;
  label: string;
  error?: string;
  hideLabel?: boolean;
  containerClassName?: string;
  errorClassName?: string;
  triggerProps?: React.ComponentProps<typeof Select.Trigger> &
    React.RefAttributes<HTMLButtonElement>;
  children?: JSX.Element;
} & React.ComponentProps<typeof Select.Root> &
  React.RefAttributes<HTMLDivElement>;

export const FieldSelect = ({
  name,
  label,
  error,
  hideLabel = false,
  containerClassName = '',
  errorClassName = 'text-accent-6',
  triggerProps = {},
  children,
  ...rest
}: FieldSelectProps) => {
  const ariaLabelledBy = `${name}-label`;
  const ariaDescribedBy = `${name}-error`;

  return (
    <Grid className={containerClassName} gap="1">
      <Text as="span" id={ariaLabelledBy} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </Text>
      <Select.Root name={name} {...rest}>
        <Select.Trigger
          aria-labelledby={ariaLabelledBy}
          aria-describedby={error ? ariaDescribedBy : undefined}
          {...triggerProps}
        />
        {children}
      </Select.Root>
      {error && (
        <Text as="p" id={ariaDescribedBy} className={errorClassName}>
          {error}
        </Text>
      )}
    </Grid>
  );
};
