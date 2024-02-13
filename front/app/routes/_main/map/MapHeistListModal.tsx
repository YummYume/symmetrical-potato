import { MagnifyingGlassIcon, ZoomInIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, IconButton, Text, TextField } from '@radix-ui/themes';
import { useMap } from '@vis.gl/react-google-maps';
import { useId, useMemo, useState, type ComponentProps, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { NavLink } from '~/lib/components/Link';
import { HeistHoverCard } from '~/lib/components/heist/HeistHoverCard';
import { HeistListItem } from '~/lib/components/heist/HeistListItem';
import { getUriId } from '~/lib/utils/path';

import type { Loader } from './route';
import type { useLoaderData } from '@remix-run/react';

type Heists = ReturnType<typeof useLoaderData<Loader>>['heists']['edges'];

export type MapHeistListModalProps = {
  title: string;
  description: string;
  heists: Heists;
  showFocusButton?: boolean;
  onHeistClick?: (event: MouseEvent<HTMLAnchorElement>, heist: Heists[number]['node']) => void;
  children?: React.ReactNode;
} & ComponentProps<typeof Dialog.Root>;

export const MapHeistListModal = ({
  title,
  description,
  heists,
  showFocusButton = false,
  onHeistClick = undefined,
  children,
  ...rest
}: MapHeistListModalProps) => {
  const { t } = useTranslation();
  const map = useMap();
  const [search, setSearch] = useState('');
  const liveRegionId = useId();
  const filteredHeists = useMemo(() => {
    return heists.filter(({ node: heist }) => {
      return heist.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [heists, search]);

  return (
    <Dialog.Root {...rest}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {description}
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
              {t('map.heists.results', { count: filteredHeists.length })}
            </Text>
            {filteredHeists.length > 0 && (
              <ul className="space-y-3">
                {filteredHeists.map(({ node: heist }) => (
                  <li className="flex items-center justify-center gap-2" key={heist.id}>
                    <HeistHoverCard
                      name={heist.name}
                      description={heist.description}
                      startAt={heist.startAt}
                      shouldEndAt={heist.shouldEndAt}
                      minimumPayout={heist.minimumPayout}
                      maximumPayout={heist.maximumPayout}
                      objectiveCount={heist.objectives.length}
                      heistersCount={heist.crewMembers.totalCount}
                      phase={heist.phase}
                      preferedTactic={heist.preferedTactic}
                      difficulty={heist.difficulty}
                      location={{
                        id: heist.location.placeId,
                        name: heist.location.name,
                      }}
                      establishment={{
                        id: heist.establishment.id,
                        name: heist.establishment.name,
                      }}
                      align="end"
                    >
                      <NavLink
                        unstyled
                        className="grow"
                        to={`/map/${heist.location.placeId}/${getUriId(heist.id)}`}
                        withCurrentSearchParams
                        onClick={(e) => {
                          if (onHeistClick) {
                            onHeistClick(e, heist);
                          }
                        }}
                      >
                        <HeistListItem
                          name={heist.name}
                          crewMembers={heist.crewMembers.totalCount}
                          startAt={heist.startAt}
                          phase={heist.phase}
                        />
                      </NavLink>
                    </HeistHoverCard>

                    {showFocusButton && (
                      <IconButton
                        size="3"
                        variant="solid"
                        radius="full"
                        color="grass"
                        aria-label={t('map.heists.focus_on_heist', { heist: heist.name })}
                        onClick={() => {
                          if (!map) {
                            return;
                          }

                          map.setZoom(16);
                          map.panTo({
                            lat: heist.location.latitude,
                            lng: heist.location.longitude,
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
