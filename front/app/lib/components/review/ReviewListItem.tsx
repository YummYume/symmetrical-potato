import { Card, Grid, Text } from '@radix-ui/themes';

import { getUriId } from '~/lib/utils/path';
import { truncate } from '~/lib/utils/string';

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
    description?: string;
    globalRating?: number;
  };
  comment?: string;
  rating: number;
} & ComponentProps<typeof Card>;

export const ReviewListItem = ({ user, comment, rating, ...rest }: ReviewListItemProps) => {
  return (
    <Card size="2" {...rest}>
      <Grid className="!grid-cols-[max-content_auto]" gap="4" columns="2">
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
        <Grid gap="2">
          <Rating style={{ width: 125 }} value={rating} readOnly />
          {comment && (
            <Text as="p" size="3" className="grow">
              {truncate(comment, 300)}
            </Text>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};
