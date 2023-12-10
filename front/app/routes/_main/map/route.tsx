import * as Dialog from '@radix-ui/react-dialog';
import { Outlet, useMatches, useNavigate } from '@remix-run/react';
import { APIProvider, type Map } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';

import HeistMap from '~/lib/components/HeistMap';
import { getEnv } from '~/lib/utils/env';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
  };
}

export type Loader = typeof loader;

export default function MapPage() {
  const navigate = useNavigate();
  const matches = useMatches();
  const mapRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapOptions: React.ComponentProps<typeof Map> = {
    onClick: (e) => {
      const placeId = e.detail.placeId;

      if (placeId) {
        navigate(`/map/${placeId}`, { unstable_viewTransition: true });
      }
    },
  };

  useEffect(() => {
    if (matches.at(-1)?.id === 'routes/_main/map/$placeId/route') {
      setDrawerOpen(true);

      return;
    }

    setDrawerOpen(false);
  }, [matches]);

  return (
    <div className="relative h-[calc(100vh-106px)]" ref={mapRef}>
      <APIProvider apiKey={getEnv('GOOGLE_MAPS_API_KEY')}>
        <HeistMap options={mapOptions} />
        <Dialog.Root
          open={drawerOpen}
          modal={false}
          onOpenChange={(opened) => {
            if (!opened) {
              navigate('/map', { unstable_viewTransition: true });
            }
          }}
        >
          <Dialog.Portal container={mapRef.current}>
            <Dialog.Overlay />
            <Dialog.Content
              className="drawer drawer--left"
              onInteractOutside={(e) => e.preventDefault()}
            >
              <Outlet />
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </APIProvider>
    </div>
  );
}
