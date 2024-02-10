import * as Dialog from '@radix-ui/react-dialog';
import {
  Cross1Icon,
  GearIcon,
  InputIcon,
  QuestionMarkIcon,
  SwitchIcon,
} from '@radix-ui/react-icons';
import { Button, IconButton, Dialog as Modal, Switch, Text } from '@radix-ui/themes';
import { Flex } from '@radix-ui/themes';
import {
  Outlet,
  useLoaderData,
  useMatches,
  useNavigate,
  useRouteLoaderData,
} from '@remix-run/react';
import { APIProvider, Marker, type Map } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormDataFromSearchParams, useRemixForm } from 'remix-hook-form';

import { getUpcomingHeists } from '~/lib/api/heist';
import HeistMap from '~/lib/components/HeistMap';
import { NavLink } from '~/lib/components/Link';
import { HeistListItem } from '~/lib/components/heist/HeistListItem';
import { getEnv } from '~/lib/utils/env';
import { mapFiltersResolver } from '~/lib/validators/map-filters';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { Loader as PlaceIdLoader } from './$placeId/route';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { MapFiltersFormData } from '~/lib/validators/map-filters';

type MarkerType = {
  placeId: string;
  latitude: number;
  longitude: number;
  count: number;
  label: string;
};

// Manhattan bridge
const DEFAULT_LATITUDE = 40.7074959;
const DEFAULT_LONGITUDE = -73.9907742;

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  const filters = getFormDataFromSearchParams(request);
  const heistResponse = await getUpcomingHeists(context.client);

  return {
    locale: context.locale,
    heists: heistResponse.heists,
    markers: heistResponse.heists.edges.reduce<MarkerType[]>((markers, { node }) => {
      const { latitude, longitude, name, placeId } = node.location;
      const existingMarker = markers.find(
        (marker) => marker.latitude === latitude && marker.longitude === longitude,
      );

      if (existingMarker) {
        return markers.map((marker) =>
          marker === existingMarker ? { ...marker, count: marker.count + 1 } : marker,
        );
      }

      return [...markers, { placeId, latitude, longitude, count: 1, label: name }];
    }, []),
  };
}

export type Loader = typeof loader;

export default function MapPage() {
  const { heists, markers, locale } = useLoaderData<Loader>();
  const placeIdData = useRouteLoaderData<PlaceIdLoader>('routes/_main/map/$placeId/route');
  const matches = useMatches();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MarkerType | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const methods = useRemixForm<MapFiltersFormData>({
    mode: 'onChange',
    resolver: mapFiltersResolver,
    submitConfig: {
      unstable_viewTransition: true,
      method: 'get',
      replace: true,
      navigate: false,
    },
  });
  const selectedHeists = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    return heists.edges.filter(({ node }) => node.location.placeId === selectedLocation.placeId);
  }, [heists, selectedLocation]);
  const mapOptions = useMemo<React.ComponentProps<typeof Map>>(() => {
    return {
      center: placeIdData
        ? {
            lat:
              placeIdData.locationInfo?.location?.latitude ??
              placeIdData.place?.location.latitude ??
              DEFAULT_LATITUDE,
            lng:
              placeIdData.locationInfo?.location?.longitude ??
              placeIdData.place?.location.longitude ??
              DEFAULT_LONGITUDE,
          }
        : { lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE },
      onClick: (e) => {
        const placeId = e.detail.placeId;

        if (placeId) {
          navigate(`/map/${placeId}`, { unstable_viewTransition: true });
        }
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!localStorage) {
      return;
    }

    const storedShowMarkers = localStorage.getItem('showMarkers');

    if (storedShowMarkers === 'false') {
      setShowMarkers(false);
    } else {
      setShowMarkers(true);
    }
  }, []);

  useEffect(() => {
    if (matches.at(-1)?.id.startsWith('routes/_main/map/$placeId')) {
      setDrawerOpen(true);

      return;
    }

    setDrawerOpen(false);
  }, [matches]);

  return (
    <div className="relative h-[calc(100vh-106px)]" ref={mapRef}>
      <div className="absolute right-0 top-0 z-10 flex items-center justify-center gap-1 rounded-bl-4 bg-slate-1 p-1 shadow-4">
        {/* Map filters modal */}
        <Modal.Root>
          <Modal.Trigger>
            <IconButton
              aria-label={t('map.filters')}
              size="2"
              variant="solid"
              radius="full"
              color="gold"
            >
              <InputIcon width="18" height="18" />
            </IconButton>
          </Modal.Trigger>

          <Modal.Content style={{ maxWidth: 600 }}>
            <Modal.Title>{t('map.filters')}</Modal.Title>
            <Modal.Description size="2" mb="4">
              {t('map.filters.description')}
            </Modal.Description>

            <Flex direction="column" gap="3">
              {/* TODO */}
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Modal.Close>
                <Button variant="soft" color="blue">
                  {t('close')}
                </Button>
              </Modal.Close>
            </Flex>
          </Modal.Content>
        </Modal.Root>

        {/* Map settings modal */}
        <Modal.Root>
          <Modal.Trigger>
            <IconButton
              aria-label={t('map.settings')}
              size="2"
              variant="solid"
              radius="full"
              color="blue"
            >
              <GearIcon width="18" height="18" />
            </IconButton>
          </Modal.Trigger>

          <Modal.Content style={{ maxWidth: 600 }}>
            <Modal.Title>{t('map.settings')}</Modal.Title>
            <Modal.Description size="2" mb="4">
              {t('map.settings.description')}
            </Modal.Description>

            <Flex direction="column" gap="3">
              <Text as="label" size="2">
                <Flex gap="2">
                  <Switch
                    checked={showMarkers}
                    onCheckedChange={(checked) => {
                      setShowMarkers(checked);
                      localStorage.setItem('showMarkers', checked ? 'true' : 'false');
                    }}
                  />{' '}
                  {t('map.settings.show_markers')}
                </Flex>
              </Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Modal.Close>
                <Button variant="soft" color="blue">
                  {t('close')}
                </Button>
              </Modal.Close>
            </Flex>
          </Modal.Content>
        </Modal.Root>

        {/* Map help modal */}
        <Modal.Root>
          <Modal.Trigger>
            <IconButton
              aria-label={t('map.help')}
              size="2"
              variant="solid"
              radius="full"
              color="green"
            >
              <QuestionMarkIcon width="18" height="18" />
            </IconButton>
          </Modal.Trigger>

          <Modal.Content style={{ maxWidth: 600 }}>
            <Modal.Title>{t('map.help')}</Modal.Title>
            <Modal.Description size="2" mb="4">
              {t('map.help.description')}
            </Modal.Description>

            <Flex direction="column" gap="3">
              {['markers', 'drawer', 'unknow_location', 'filters'].map((section) => (
                <Flex direction="column" key={section}>
                  <Text size="3" weight="bold">
                    {t(`map.help.${section}`)}
                  </Text>
                  <Text color="gray" size="2">
                    {t(`map.help.${section}_description`)}
                  </Text>
                </Flex>
              ))}
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Modal.Close>
                <Button variant="soft" color="blue">
                  {t('close')}
                </Button>
              </Modal.Close>
            </Flex>
          </Modal.Content>
        </Modal.Root>
      </div>

      {/* Quick heist selection modal */}
      <Modal.Root
        open={!!selectedLocation}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLocation(null);
          }
        }}
      >
        <Modal.Content style={{ maxWidth: 600 }}>
          <Modal.Title>{selectedLocation?.label}</Modal.Title>
          <Modal.Description size="2" mb="4">
            {t('map.heists_for_location', { location: selectedLocation?.label })}
          </Modal.Description>

          <Flex direction="column" gap="3">
            <ul>
              {selectedHeists.map(({ node: heist }) => (
                <li key={heist.id}>
                  {/* TODO heist page */}
                  <NavLink
                    unstyled
                    to={`/map/${heist.location.placeId}`}
                    onClick={(e) => {
                      e.preventDefault();

                      setSelectedLocation(null);
                      navigate(`/map/${heist.location.placeId}`, {
                        unstable_viewTransition: true,
                      });
                    }}
                  >
                    <HeistListItem
                      name={heist.name}
                      crewMembers={heist.crewMembers.totalCount}
                      startAt={heist.startAt}
                      locale={locale}
                      phase={heist.phase}
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Modal.Close>
              <Button variant="soft" color="blue">
                {t('close')}
              </Button>
            </Modal.Close>
          </Flex>
        </Modal.Content>
      </Modal.Root>

      {/* Actual map */}
      <APIProvider apiKey={getEnv('GOOGLE_MAPS_API_KEY')}>
        <HeistMap options={mapOptions}>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.latitude, lng: marker.longitude }}
              title={marker.label}
              clickable
              visible={showMarkers}
              onClick={() => {
                setSelectedLocation(marker);
              }}
            />
          ))}
        </HeistMap>
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
              <Dialog.Close aria-label={t('close')}>
                <span className="absolute right-2 top-2">
                  <Cross1Icon width="18" height="18" />
                </span>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </APIProvider>
    </div>
  );
}
