import { type PropsWithoutRefOrColor, Text } from '@radix-ui/themes';

import type { DefaultLabelProps } from '~/lib/types/form';

export type LabelProps = DefaultLabelProps & Omit<PropsWithoutRefOrColor<'label' | 'span'>, 'as'>;

export function Label({ id, className, children, as = 'label', ...rest }: LabelProps) {
  return (
    <Text {...rest} id={id} className={className} as={as}>
      {children}
    </Text>
  );
}
