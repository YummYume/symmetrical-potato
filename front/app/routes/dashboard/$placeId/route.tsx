import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { getLocationInfo } from '~/lib/api/location';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { Loader } from '~/root';

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

  return {};
}

export default function PlaceId() {
  const locationInfo = useLoaderData<Loader>();

  console.log(locationInfo);

  return (
    <div>
      <h1>Place ID</h1>
    </div>
  );
}
