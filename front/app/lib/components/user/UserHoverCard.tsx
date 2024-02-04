import { Box, Flex, Heading, HoverCard, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { UserAvatar } from './UserAvatar';
import { UserMainRoleBadge } from './UserMainRoleBadge';

import type { ComponentProps } from 'react';

export type UserHoverCardProps = {
  username: string;
  description?: string;
  mainRole?: string | null;
  children?: JSX.Element;
} & ComponentProps<typeof HoverCard.Content>;

export const UserHoverCard = ({
  username,
  description,
  mainRole,
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
              align="center"
              justify="between"
            >
              <Heading size="3" as="h3">
                {username}
              </Heading>

              {mainRole && <UserMainRoleBadge mainRole={mainRole} />}
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
