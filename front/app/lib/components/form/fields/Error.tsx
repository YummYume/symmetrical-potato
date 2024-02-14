import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Flex, Text, type PropsWithoutRefOrColor } from '@radix-ui/themes';

import type { DefaultErrorProps } from '~/lib/types/form';

export type ErrorProps = DefaultErrorProps & Omit<PropsWithoutRefOrColor<'p'>, 'as'>;

export function Error({
  id,
  containerClassName = 'ml-1 text-ruby-11 dark:text-ruby-10',
  children,
  ...rest
}: ErrorProps) {
  return (
    <Flex align="center" gap="1" className={containerClassName}>
      <CrossCircledIcon width="18" height="18" className="shrink-0" />
      <Text size="2" {...rest} as="p" id={id}>
        {children}
      </Text>
    </Flex>
  );
}
