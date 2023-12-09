import { Outlet, useNavigate } from '@remix-run/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useRef } from 'react';

import HeistMap from '~/lib/components/HeistMap';
import { getEnv } from '~/lib/utils/env';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';
import type { Map } from '@vis.gl/react-google-maps';

export async function loader({ context }: DataFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
  };
}

export type Loader = typeof loader;

export default function MapPage() {
  const navigate = useNavigate();

  const mapRef = useRef<HTMLDivElement>(null);

  const mapOptions: React.ComponentProps<typeof Map> = {};

  mapOptions.onClick = (e) => {
    const placeId = e.detail.placeId;

    if (placeId) {
      navigate(`/map/${placeId}`);
    }
  };

  return (
    <div className="relative h-[calc(100vh-106px)]" ref={mapRef}>
      <APIProvider apiKey={getEnv('GOOGLE_MAPS_API_KEY')}>
        <HeistMap options={mapOptions} />
        <Outlet context={mapRef.current} />
      </APIProvider>
    </div>
  );
}
