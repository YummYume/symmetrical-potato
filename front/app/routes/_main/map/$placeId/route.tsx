import { Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocationInfo } from '~/lib/api/location';
import { Drawer } from '~/lib/components/Drawer';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

  try {
    const locationInfo = await getLocationInfo(context.client, params.placeId);

    return {
      locationInfo,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    locationInfo: null,
  };
}

export type Loader = typeof loader;

export default function PlaceId() {
  const { locationInfo } = useLoaderData<Loader>();

  const navigate = useNavigate();

  const { container } = useOutletContext<{ container: HTMLDivElement }>();

  const [drawerOpen, setDrawerOpen] = useState(true);

  const { t } = useTranslation();

  return (
    <Drawer
      container={container}
      onClose={() => navigate('/map')}
      open={drawerOpen}
      setOpen={setDrawerOpen}
    >
      <Section size="1">
        <Heading as="h2" size="8">
          {t('common.heists')}
        </Heading>
        <Grid gap="3">
          {locationInfo?.heists?.edges?.map(
            (heist) =>
              heist && (
                <Text as="p" key={heist.node?.id}>
                  {heist.node?.name}
                </Text>
              ),
          )}
        </Grid>
      </Section>
    </Drawer>
  );
}
