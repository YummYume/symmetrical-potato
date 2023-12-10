import * as Dialog from '@radix-ui/react-dialog';
import { Outlet, useMatches, useNavigate } from '@remix-run/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';

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
              className="
                absolute
                left-0
                top-0
                h-full
                min-w-[30rem]
                overflow-y-auto
                bg-mauve-4
                p-6
                shadow-4
                animate-duration-300
                scrollbar-thin
                scrollbar-track-mauve-10
                scrollbar-thumb-accent-5
                scrollbar-track-rounded-4
                scrollbar-thumb-rounded-4
                radix-state-closed:animate-fade-right
                radix-state-closed:animate-reverse
                radix-state-open:animate-fade-right
                motion-reduce:animate-none
              "
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
