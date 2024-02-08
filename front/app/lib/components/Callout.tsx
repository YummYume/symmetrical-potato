import * as Icons from '@radix-ui/react-icons';
import { Callout as CT } from '@radix-ui/themes';

import type { IconProps } from '@radix-ui/react-icons/dist/types';

type RxIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

type CalloutProps = {
  icon?: JSX.Element | keyof typeof Icons;
  content: string;
} & React.ComponentProps<typeof CT.Root>;

export function Callout({ icon = 'InfoCircledIcon', content, ...rest }: CalloutProps) {
  let Icon: RxIcon | undefined;

  if (typeof icon === 'string') {
    if (!Icons[icon]) {
      Icon = Icons.InfoCircledIcon;
    } else {
      Icon = Icons[icon];
    }
  }

  return (
    <CT.Root {...rest}>
      <CT.Icon>{Icon ? <Icon /> : icon}</CT.Icon>
      <CT.Text>{content}</CT.Text>
    </CT.Root>
  );
}
