import { Button, Popover as PR } from '@radix-ui/themes';
import { type ComponentProps } from 'react';

type PopoverProps = {
  triggerColor?: ComponentProps<typeof Button>['color'];
  triggerProps?: ComponentProps<typeof Button>;
  triggerChildren: JSX.Element | string;
  children: JSX.Element;
} & React.ComponentProps<typeof PR.Root>;

function Popover({
  triggerColor = 'purple',
  triggerProps = { variant: 'soft' },
  triggerChildren,
  children,
  ...rest
}: PopoverProps) {
  return (
    <PR.Root {...rest}>
      <PR.Trigger>
        <Button type="button" color={triggerColor} {...triggerProps}>
          {triggerChildren}
        </Button>
      </PR.Trigger>
      <PR.Content>{children}</PR.Content>
    </PR.Root>
  );
}

export default Popover;
