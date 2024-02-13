import { Container, Heading, Section, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { getHeistsForUser } from '~/lib/api/heist';
import { HeistHoverCard } from '~/lib/components/heist/HeistHoverCard';
import { HeistListItem } from '~/lib/components/heist/HeistListItem';
import { i18next } from '~/lib/i18n/index.server';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { Link } from '~components/Link';
import dayjs from '~utils/dayjs';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER]);

  const t = await i18next.getFixedT(request, 'common');
  const { heists } = await getHeistsForUser(context.client, getUriId(user.id));

  return {
    heists: heists.edges,
    meta: {
      title: t('meta.my_heists.title'),
      description: t('meta.my_heists.description'),
    },
  };
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export default function MyHeists() {
  const { t } = useTranslation();
  const { heists } = useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Heading align="center" as="h1" size="9">
          {t('my_heists')}
        </Heading>
        <Section className="space-y-3">
          <Heading as="h2" size="6">
            {t('my_heists.all')}
          </Heading>
          {heists.length === 0 && (
            <Text as="p" size="2" color="gray">
              {t('my_heists.no_heists_found')}
            </Text>
          )}
          {heists.length > 0 && (
            <ul className="space-y-3">
              {heists
                .sort((a, b) => -dayjs(a.node.startAt).diff(dayjs(b.node.startAt)))
                .map(({ node }) => {
                  return (
                    <li key={node.id}>
                      <HeistHoverCard
                        name={node.name}
                        description={node.description}
                        startAt={node.startAt}
                        shouldEndAt={node.shouldEndAt}
                        minimumPayout={node.minimumPayout}
                        maximumPayout={node.maximumPayout}
                        objectiveCount={node.objectives.length}
                        heistersCount={node.crewMembers.totalCount}
                        phase={node.phase}
                        preferedTactic={node.preferedTactic}
                        difficulty={node.difficulty}
                        location={{
                          id: node.location.placeId,
                          name: node.location.name,
                        }}
                        establishment={{
                          id: node.establishment.id,
                          name: node.establishment.name,
                        }}
                        align="end"
                      >
                        <Link to={`/map/${node.location.placeId}/${getUriId(node.id)}`}>
                          <HeistListItem
                            name={node.name}
                            crewMembers={node.crewMembers.totalCount}
                            startAt={node.startAt}
                            phase={node.phase}
                          />
                        </Link>
                      </HeistHoverCard>
                    </li>
                  );
                })}
            </ul>
          )}
        </Section>
      </Container>
    </main>
  );
}
