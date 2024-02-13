import * as Dialog from '@radix-ui/react-dialog';
import {
  Cross1Icon,
  GearIcon,
  InputIcon,
  ListBulletIcon,
  QuestionMarkIcon,
  SewingPinFilledIcon,
} from '@radix-ui/react-icons';
import { IconButton } from '@radix-ui/themes';
import {
  Outlet,
  useLoaderData,
  useMatches,
  useNavigate,
  useRouteLoaderData,
  useSubmit,
} from '@remix-run/react';
import { APIProvider, Marker, type Map } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getEstablishments } from '~/lib/api/establishment';
import { getUpcomingHeists } from '~/lib/api/heist';
import HeistMap from '~/lib/components/HeistMap';
import { i18next } from '~/lib/i18n/index.server';
import { getEnv } from '~/lib/utils/env';
import { mapFiltersResolver } from '~/lib/validators/map-filters';
import { denyAccessUnlessGranted } from '~utils/security.server';

import { MapFiltersModal } from './MapFiltersModal';
import { MapHeistListModal } from './MapHeistListModal';
import { MapHelpModal } from './MapHelpModal';
import { MapLocationListModal } from './MapLocationListModal';
import { MapSettingsModal } from './MapSettingsModal';

import type { Loader as PlaceIdLoader } from './$placeId/route';
import type { Locations } from './MapLocationListModal';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
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

  const t = await i18next.getFixedT(request, 'common');
  const { errors, data, receivedValues } = await getValidatedFormData(request, mapFiltersResolver);
  const filters: Parameters<typeof getUpcomingHeists>[1] | undefined = errors
    ? undefined
    : {
        startAt:
          data.startAtMin || data.startAtMax
            ? [
                {
                  after: data.startAtMin,
                  before: data.startAtMax,
                },
              ]
            : undefined,
        shouldEndAt:
          data.shouldEndAtMin || data.shouldEndAtMax
            ? [
                {
                  after: data.shouldEndAtMin,
                  before: data.shouldEndAtMax,
                },
              ]
            : undefined,
        minimumPayout: data.minimumPayout
          ? [
              {
                gte: data.minimumPayout.toString(),
              },
            ]
          : undefined,
        maximumPayout: data.maximumPayout
          ? [
              {
                lte: data.maximumPayout.toString(),
              },
            ]
          : undefined,
        preferedTactic: Array.isArray(data.preferedTactics)
          ? data.preferedTactics.map((preferedTactic) => preferedTactic.value)
          : undefined,
        difficulty: Array.isArray(data.difficulties)
          ? data.difficulties.map((difficulty) => difficulty.value)
          : undefined,
        establishment__id: Array.isArray(data.establishments)
          ? data.establishments.map((establishment) => establishment.value)
          : undefined,
      };

  const [{ heists }, { establishments }] = await Promise.all([
    getUpcomingHeists(context.client, filters),
    getEstablishments(context.client),
  ]);

  return {
    errors,
    receivedValues,
    establishments,
    heists,
    markers: heists.edges.reduce<MarkerType[]>((markers, { node }) => {
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
    meta: {
      title: t('meta.map.title'),
      description: t('meta.map.description'),
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

export default function MapPage() {
  // Loader data
  const { heists, markers, establishments, errors, receivedValues } = useLoaderData<Loader>();
  const placeIdData = useRouteLoaderData<PlaceIdLoader>('routes/_main/map/$placeId/route');
  // States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MarkerType | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  // Hooks
  const matches = useMatches();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { t, i18n } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const methods = useRemixForm<MapFiltersFormData>({
    mode: 'onSubmit',
    resolver: mapFiltersResolver,
    errors,
    submitConfig: {
      unstable_viewTransition: true,
      method: 'get',
      replace: true,
    },
    defaultValues: receivedValues,
    submitHandlers: {
      onValid: (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '' || value === 0) {
            return;
          }

          if (Array.isArray(value)) {
            value.forEach((v) => {
              formData.append(`${key}[]`, JSON.stringify(v));
            });

            return;
          }

          formData.set(key, JSON.stringify(value));
        });

        submit(formData, {
          unstable_viewTransition: true,
          method: 'get',
          replace: true,
          preventScrollReset: true,
        });
      },
    },
  });
  const locations = useMemo<Locations>(() => {
    return heists.edges.reduce<Locations>((currentLocations, { node }) => {
      const { latitude, longitude, name, placeId, address, averageRating } = node.location;
      const existingLocation = currentLocations.find((location) => location.placeId === placeId);

      if (existingLocation) {
        return currentLocations.map((location) =>
          location === existingLocation
            ? { ...location, heistsCount: location.heistsCount + 1 }
            : location,
        );
      }

      return [
        ...currentLocations,
        { placeId, latitude, longitude, name, address, averageRating, heistsCount: 1 },
      ];
    }, []);
  }, [heists]);
  const selectedHeists = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    return heists.edges.filter(({ node }) => node.location.placeId === selectedLocation.placeId);
  }, [heists, selectedLocation]);
  const mapOptions = useMemo<React.ComponentProps<typeof Map>>(() => {
    return {
      defaultCenter: placeIdData
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
    <APIProvider apiKey={getEnv('GOOGLE_MAPS_API_KEY')} language={i18n.language}>
      <div className="relative h-[calc(100vh-106px)]" ref={mapRef}>
        <div className="absolute right-0 top-0 z-10 flex items-center justify-center gap-1 rounded-bl-4 bg-slate-1 p-1 shadow-4">
          {/* Map locations modal */}
          <MapLocationListModal locations={locations} showFocusButton>
            <IconButton
              aria-label={t('map.locations')}
              size="2"
              variant="solid"
              radius="full"
              color="gray"
            >
              <SewingPinFilledIcon width="18" height="18" />
            </IconButton>
          </MapLocationListModal>

          {/* Map heists modal */}
          <MapHeistListModal
            title={t('map.heists')}
            description={t('map.heists.all_available')}
            heists={heists.edges}
            showFocusButton
          >
            <IconButton
              aria-label={t('map.heists')}
              size="2"
              variant="solid"
              radius="full"
              color="pink"
            >
              <ListBulletIcon width="18" height="18" />
            </IconButton>
          </MapHeistListModal>

          {/* Map filters modal */}
          <MapFiltersModal methods={methods} establishments={establishments}>
            <IconButton
              aria-label={t('map.filters')}
              size="2"
              variant="solid"
              radius="full"
              color="gold"
            >
              <InputIcon width="18" height="18" />
            </IconButton>
          </MapFiltersModal>

          {/* Map settings modal */}
          <MapSettingsModal showMarkers={showMarkers} setShowMarkers={setShowMarkers}>
            <IconButton
              aria-label={t('map.settings')}
              size="2"
              variant="solid"
              radius="full"
              color="blue"
            >
              <GearIcon width="18" height="18" />
            </IconButton>
          </MapSettingsModal>

          {/* Map help modal */}
          <MapHelpModal>
            <IconButton
              aria-label={t('map.help')}
              size="2"
              variant="solid"
              radius="full"
              color="green"
            >
              <QuestionMarkIcon width="18" height="18" />
            </IconButton>
          </MapHelpModal>
        </div>

        {/* Quick heist selection modal (opened when a marker is clicked) */}
        <MapHeistListModal
          open={!!selectedLocation}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedLocation(null);
            }
          }}
          title={selectedLocation?.label ?? ''}
          description={t('map.heists.all_available_for_location', {
            location: selectedLocation?.label,
          })}
          heists={selectedHeists}
        />

        {/* Actual map */}
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

        {/* Drawer */}
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
      </div>
    </APIProvider>
  );
}
