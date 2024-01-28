import { InfoCircledIcon } from '@radix-ui/react-icons';
import { type PropsWithoutRefOrColor, Text, Flex } from '@radix-ui/themes';

import type { DefaultHelpProps } from '~/lib/types/form';

export type HelpProps = DefaultHelpProps & Omit<PropsWithoutRefOrColor<'p'>, 'as'>;

export function Help({ id, containerClassName = 'ml-1', children, ...rest }: HelpProps) {
  return (
    <Flex align="center" gap="1" className={containerClassName}>
      <InfoCircledIcon width="18" height="18" />
      <Text size="2" {...rest} as="p" id={id}>
        {children}
      </Text>
    </Flex>
  );
}
