import { Card, Flex, Text } from '@radix-ui/themes';

import { getUriId } from '~/lib/utils/path';
import { truncate } from '~/lib/utils/string';

import { Link } from '../Link';
import { UserAvatar } from '../user/UserAvatar';
import { UserHoverCard } from '../user/UserHoverCard';

import type { ComponentProps } from 'react';

export type EmployeeListItemProps = {
  user: {
    id: string;
    mainRole: string;
    username: string;
    description?: string;
    globalRating?: number;
  };
  codeName: string;
  description?: string;
} & ComponentProps<typeof Card>;

export const EmployeeListItem = ({
  user,
  codeName,
  description,
  ...rest
}: EmployeeListItemProps) => {
  return (
    <Card size="2" {...rest}>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <UserHoverCard
          username={user.username}
          mainRole={user.mainRole}
          description={user.description}
          globalRating={user.globalRating}
        >
          <Link to={`/profile/${getUriId(user.id)}`}>
            <UserAvatar username={user.username} mainRole={user.mainRole} />
          </Link>
        </UserHoverCard>
        <Flex direction="column" gap="1">
          <Text as="p" size="2" className="grow">
            {user.username} {codeName && <>({codeName})</>}
          </Text>
          {description && (
            <Text as="p" size="2" color="gray">
              {truncate(description, 150)}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
