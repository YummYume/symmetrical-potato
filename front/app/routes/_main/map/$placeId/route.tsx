import { Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocationInfo } from '~/lib/api/location';
import { Drawer } from '~/lib/components/Drawer';
import { Link } from '~/lib/components/Link';
import { hasPathError } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

  try {
    const locationInfo = await getLocationInfo(context.client, params.placeId);

    return {
      locale: context.locale,
      locationInfo,
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'location')) {
      throw e;
    }
  }

  return {
    locale: null,
    locationInfo: null,
  };
}

export type Loader = typeof loader;

export default function PlaceId() {
  const { locationInfo, locale } = useLoaderData<Loader>();

  const navigate = useNavigate();

  const container = useOutletContext<HTMLDivElement>();

  const [drawerOpen, setDrawerOpen] = useState(true);

  const { t } = useTranslation();

  return (
    <Drawer
      container={container}
      onClose={() => navigate('/map')}
      open={drawerOpen}
      setOpen={setDrawerOpen}
    >
      <Section className="space-y-4" size="1">
        <Heading as="h2" size="8">
          {locationInfo?.location?.name}
        </Heading>
        <Grid gap="2">
          <Text as="p">{locationInfo?.location?.address}</Text>
        </Grid>
      </Section>
      <Section className="space-y-4" size="1">
        <Heading as="h2" size="8">
          {t('common.heists')}
        </Heading>

        {locationInfo?.heists?.edges?.map((heist) => {
          if (heist) {
            return (
              <Grid gap="2" key={heist.node?.id}>
                <Link className="w-fit" to="/">
                  <Heading as="h3" size="6">
                    {heist.node?.name}
                  </Heading>
                </Link>
                <Text as="p">{heist.node?.difficulty}</Text>
                <Text as="p">{heist.node?.minimumPayout}</Text>
                <Text as="p">{heist.node?.maximumPayout}</Text>
                <Text as="p">{heist.node?.preferedTactic}</Text>
                <Text as="p">
                  {new Date(heist.node?.startAt ?? 'now').toLocaleDateString(locale, {
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Grid>
            );
          }

          return null;
        })}
      </Section>
    </Drawer>
  );
}
