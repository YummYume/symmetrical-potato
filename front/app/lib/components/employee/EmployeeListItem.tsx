import { Card, Flex, Text } from '@radix-ui/themes';

import { getUriId } from '~/lib/utils/path';

import { Link } from '../Link';
import { UserAvatar } from '../user/UserAvatar';
import { UserHoverCard } from '../user/UserHoverCard';

import type { ComponentProps } from 'react';

export type EmployeeListItemProps = {
  user: {
    id: string;
    mainRole: string;
    username: string;
  };
  codeName: string;
} & ComponentProps<typeof Card>;

export const EmployeeListItem = ({ user, codeName, ...rest }: EmployeeListItemProps) => {
  return (
    <Card size="2" {...rest}>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <UserHoverCard username={user.username} mainRole={user.mainRole}>
          <Link to={`/profile/${getUriId(user.id)}`}>
            <UserAvatar username={user.username} mainRole={user.mainRole} />
          </Link>
        </UserHoverCard>
        <Text as="p" size="2" className="grow">
          {user.username} {codeName && <>({codeName})</>}
        </Text>
      </Flex>
    </Card>
  );
};
