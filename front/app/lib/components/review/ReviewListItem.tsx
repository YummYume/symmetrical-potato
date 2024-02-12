import { Card, Flex, Text } from '@radix-ui/themes';

import { getUriId } from '~/lib/utils/path';

import { Link } from '../Link';
import { Rating } from '../Rating';
import { UserAvatar } from '../user/UserAvatar';
import { UserHoverCard } from '../user/UserHoverCard';

import type { ComponentProps } from 'react';

export type ReviewListItemProps = {
  user: {
    id: string;
    mainRole: string;
    username: string;
  };
  comment?: string;
  rating: number;
} & ComponentProps<typeof Card>;

export const ReviewListItem = ({ user, comment, rating, ...rest }: ReviewListItemProps) => {
  return (
    <Card size="2" {...rest}>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <UserHoverCard username={user.username} mainRole={user.mainRole}>
          <Link to={`/profile/${getUriId(user.id)}`}>
            <UserAvatar username={user.username} mainRole={user.mainRole} />
          </Link>
        </UserHoverCard>
        {comment ? (
          <Text as="p" color="gray" className="grow">
            {comment}
          </Text>
        ) : (
          <div className="grow" />
        )}
        <Rating style={{ width: 125 }} value={rating} readOnly />
      </Flex>
    </Card>
  );
};
