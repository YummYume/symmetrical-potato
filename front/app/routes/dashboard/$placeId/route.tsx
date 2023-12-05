import { Section } from '@radix-ui/themes';
import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';

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

export default function PlaceId({
  container,
}: Readonly<{
  container: HTMLDivElement | null;
}>) {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const { locationInfo } = useLoaderData<Loader>();

  return (
    <Drawer container={container} open={drawerOpen} setOpen={setDrawerOpen}>
      <Section>
        {locationInfo?.heists?.edges?.map(
          (heist) => heist && <p key={heist.node?.id}>{heist.node?.name}</p>,
        )}
      </Section>
    </Drawer>
  );
}
