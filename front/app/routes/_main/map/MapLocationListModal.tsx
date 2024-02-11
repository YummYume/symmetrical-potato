import { MagnifyingGlassIcon, ZoomInIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, IconButton, Text, TextField } from '@radix-ui/themes';
import { useMap } from '@vis.gl/react-google-maps';
import { useId, useMemo, useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { NavLink } from '~/lib/components/Link';
import { LocationListItem } from '~/lib/components/location/LocationListItem';

export type Locations = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  heistsCount: number;
  averageRating: number;
}[];

export type MapLocationListModalProps = {
  locations: Locations;
  showFocusButton?: boolean;
  children?: React.ReactNode;
} & ComponentProps<typeof Dialog.Root>;

export const MapLocationListModal = ({
  locations,
  showFocusButton = false,
  children,
  ...rest
}: MapLocationListModalProps) => {
  const { t } = useTranslation();
  const map = useMap();
  const [search, setSearch] = useState('');
  const liveRegionId = useId();
  const filteredLocations = useMemo(() => {
    return locations.filter(({ name }) => {
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [locations, search]);

  return (
    <Dialog.Root {...rest}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{t('map.locations')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t('map.locations.all')}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <TextField.Root>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder={t('search')}
              aria-label={t('search')}
              aria-controls={liveRegionId}
            />
          </TextField.Root>

          <div className="space-y-3" aria-live="polite" aria-atomic="true" id={liveRegionId}>
            <Text as="p" size="2" color="gray" role="status">
              {t('map.locations.results', { count: filteredLocations.length })}
            </Text>
            {filteredLocations.length > 0 && (
              <ul className="space-y-3">
                {filteredLocations.map((location) => (
                  <li className="flex items-center justify-center gap-2" key={location.placeId}>
                    {/* TODO heist page */}
                    <NavLink
                      unstyled
                      className="grow"
                      to={`/map/${location.placeId}`}
                      withCurrentSearchParams
                    >
                      <LocationListItem
                        name={location.name}
                        address={location.address}
                        heistsCount={location.heistsCount}
                        averageRating={location.averageRating}
                      />
                    </NavLink>

                    {showFocusButton && (
                      <IconButton
                        size="3"
                        variant="solid"
                        radius="full"
                        color="grass"
                        aria-label={t('map.locations.focus_on_location', { heist: location.name })}
                        onClick={() => {
                          if (!map) {
                            return;
                          }

                          map.setZoom(16);
                          map.panTo({
                            lat: location.latitude,
                            lng: location.longitude,
                          });
                        }}
                      >
                        <ZoomInIcon width="24" height="24" />
                      </IconButton>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="blue">
              {t('close')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
