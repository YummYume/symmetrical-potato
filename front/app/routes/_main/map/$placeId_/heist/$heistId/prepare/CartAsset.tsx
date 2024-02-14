import { Box, Card, Flex, Text } from '@radix-ui/themes';

import type { Asset } from '~/lib/api/types';

export function CardAsset({ asset, quantity }: { asset: Asset; quantity: number }) {
  const className =
    quantity > 0
      ? quantity === asset.maxQuantity
        ? '!border-green-6 !bg-green-3'
        : '!border-blue-6 !bg-blue-3'
      : '';
  return (
    <Card className={className}>
      <Box>
        <Flex gap="3" justify="between">
          <Text as="span" size="2" weight="bold">
            {asset.name}
          </Text>
          <Text as="span" size="2" color="gray">
            {quantity}/{asset.maxQuantity}
          </Text>
        </Flex>
      </Box>
    </Card>
  );
}
