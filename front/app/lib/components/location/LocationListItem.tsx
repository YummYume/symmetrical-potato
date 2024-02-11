import { Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Rating } from '~components/Rating';

import type { ComponentProps } from 'react';

export type LocationListItemProps = {
  name: string;
  address?: string;
  averageRating?: number;
  heistsCount?: number;
} & ComponentProps<typeof Card>;

export const LocationListItem = ({
  name,
  address,
  averageRating,
  heistsCount,
  ...rest
}: LocationListItemProps) => {
  const { t } = useTranslation();

  return (
    <Card {...rest}>
      <Flex justify="between" gap="1">
        <Flex direction="column" justify="between" gap="1" align="start">
          <Text as="p" size="2" weight="bold">
            {name}
          </Text>
          {address && (
            <Text as="p" color="gray" size="2">
              {address}
            </Text>
          )}
        </Flex>
        <Flex direction="column" justify="between" gap="1" align="end">
          {averageRating ? (
            <Rating style={{ maxWidth: 100 }} value={averageRating} readOnly />
          ) : (
            <div />
          )}
          {heistsCount !== undefined && (
            <Text as="p" size="2" weight="bold">
              {t('location.heists_count', {
                count: heistsCount,
              })}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
