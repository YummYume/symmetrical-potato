import { Card, Flex, Text } from '@radix-ui/themes';

import type { ComponentProps } from 'react';
import type { Asset } from '~/lib/api/types';

type AssetListItemProps = {
  asset: Asset;
} & ComponentProps<typeof Card>;

export function AssetListItem({ asset, ...rest }: AssetListItemProps) {
  return (
    <Card size="2" {...rest}>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Text as="p" size="2" className="grow">
          {asset.name}
        </Text>
      </Flex>
    </Card>
  );
}
