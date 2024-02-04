import { Box, Flex, Heading, HoverCard, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Rating } from '~components/Rating';

import { UserAvatar } from './UserAvatar';
import { UserMainRoleBadge } from './UserMainRoleBadge';

import type { ComponentProps } from 'react';

export type UserHoverCardProps = {
  username: string;
  description?: string;
  mainRole?: string | null;
  globalRating?: number;
  children?: JSX.Element;
} & ComponentProps<typeof HoverCard.Content>;

export const UserHoverCard = ({
  username,
  description,
  mainRole,
  globalRating,
  children,
  ...rest
}: UserHoverCardProps) => {
  const { t } = useTranslation();

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>{children}</HoverCard.Trigger>
      <HoverCard.Content side="top" align="center" {...rest}>
        <Flex gap="4">
          <UserAvatar username={username} mainRole={mainRole} size="2" />
          <Box>
            <Flex
              direction={{ initial: 'column', sm: 'row' }}
              gap="2"
              align="start"
              justify="between"
            >
              <Heading size="3" as="h3">
                {username}
              </Heading>

              <Flex direction="column" gap="1" align="end">
                {mainRole && <UserMainRoleBadge mainRole={mainRole} />}
                {globalRating && (
                  <Rating
                    style={{ width: 100, marginLeft: 'auto' }}
                    value={globalRating}
                    readOnly
                  />
                )}
              </Flex>
            </Flex>

            <Text as="p" size="2" style={{ maxWidth: 300 }} mt="3">
              {description ? description : t('user.no_description')}
            </Text>
          </Box>
        </Flex>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
