import { ArrowLeftIcon, EnterIcon, ExitIcon, PersonIcon, TrashIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Section,
  Separator,
  Table,
  Text,
} from '@radix-ui/themes';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getHeist } from '~/lib/api/heist';
import { HeistPhaseEnum, HeistVisibilityEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { HeistDifficultyBadge } from '~/lib/components/heist/HeistDifficultyBadge';
import { HeistPhaseBadge } from '~/lib/components/heist/HeistPhaseBadge';
import { HeistPreferedTacticBadge } from '~/lib/components/heist/HeistPreferedTacticBadge';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import dayjs from '~/lib/utils/dayjs';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    const { heist } = await getHeist(context.client, params.heistId);
    const isHeister = hasRoles(user, [ROLES.HEISTER]);

    return {
      heist,
      placeId: params.placeId,
      isHeister,
      isHeisterPartOfCrew:
        isHeister && heist.crewMembers.edges.some(({ node }) => node.user.id === user.id),
      isOwner: user.id === heist.establishment.contractor.id,
      meta: {
        title: heist.name,
        description: t('meta.heist.description', {
          address: heist.name,
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'heist')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: t('not_found', { ns: 'response' }),
    });
  }
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

export default function MapHeist() {
  const { heist, placeId, isHeister, isHeisterPartOfCrew, isOwner } = useLoaderData<Loader>();

  const { t } = useTranslation();

  return (
    <>
      <Link className="block w-fit" to={`/map/${placeId}`}>
        <div className="mb-2 flex h-8 items-center rounded-2 bg-gray-9 px-3 text-[white]">
          <ArrowLeftIcon />
        </div>
      </Link>
      <Link to={heist.establishment.id}>{heist.establishment.name}</Link>
      {/* Header */}
      <Section className="space-y-2" size="1">
        <Flex gap="2" align="center" justify="between">
          <Heading as="h3" size="8">
            {heist.name}
          </Heading>

          <Flex gap="2">
            {heist.crewMembers.edges.length < 4 &&
              heist.phase === HeistPhaseEnum.Planning &&
              isHeister &&
              !isHeisterPartOfCrew && (
                <FormConfirmDialog
                  formId={'heist-join'}
                  title={t('join')}
                  description={t('heist.join.confirm')}
                  action={'join'}
                  actionColor="green"
                >
                  <IconButton aria-label={t('join')}>
                    <EnterIcon />
                  </IconButton>
                </FormConfirmDialog>
              )}

            {isHeisterPartOfCrew && heist.phase === HeistPhaseEnum.Planning && (
              <FormConfirmDialog
                formId={'heist-leave'}
                title={t('leave')}
                description={t('heist.leave.confirm')}
                action={'leave'}
              >
                <IconButton aria-label={t('leave')} color="ruby">
                  <ExitIcon />
                </IconButton>
              </FormConfirmDialog>
            )}

            {isOwner && (
              <FormConfirmDialog
                formId={'heist-delete'}
                title={t('delete')}
                description={t('heist.delete.confirm')}
                action={`delete`}
              >
                <IconButton color="red" aria-label={t('delete')}>
                  <TrashIcon />
                </IconButton>
              </FormConfirmDialog>
            )}

            {/* Crew */}
            {heist.crewMembers.edges.length > 0 && (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button>
                      <span>{heist.crewMembers.edges.length}/4</span>
                      <PersonIcon />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content align="end" side="bottom" sideOffset={5}>
                    <Card>
                      <ul>
                        <li className="font-bold text-accent-9">
                          {heist.employee.codeName} ({t('employee')})
                        </li>
                        <li>
                          <Separator className="my-2 !w-full" />
                        </li>

                        {heist.crewMembers.edges.map(
                          ({
                            node: {
                              user: { id, username },
                            },
                          }) => (
                            <li key={id}>{username}</li>
                          ),
                        )}
                      </ul>
                    </Card>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </Flex>
        </Flex>
        <Text as="p">{heist.description}</Text>
      </Section>
      {/* Information */}
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.ColumnHeaderCell>{t('heist.phase')}</Table.ColumnHeaderCell>
            <Table.Cell align="right">
              <HeistPhaseBadge phase={heist.phase} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeaderCell>{t('heist.prefered_tactic')}</Table.ColumnHeaderCell>
            <Table.Cell align="right">
              <HeistPreferedTacticBadge preferedTactic={heist.preferedTactic} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeaderCell>{t('heist.difficulty')}</Table.ColumnHeaderCell>
            <Table.Cell align="right">
              <HeistDifficultyBadge difficulty={heist.difficulty} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeaderCell>{t('heist.payout')}</Table.ColumnHeaderCell>
            <Table.Cell align="right">
              {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                heist.minimumPayout,
              )}{' '}
              -{' '}
              {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                heist.maximumPayout,
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeaderCell>{t('heist.time_slot')}</Table.ColumnHeaderCell>
            <Table.Cell align="right">
              {dayjs(heist.startAt).format('DD/MM/YY')} : {dayjs(heist.startAt).format('HH:mm')} -{' '}
              {dayjs(heist.shouldEndAt).format('HH:mm')}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      {/* Objectives */}
      {heist.objectives.length > 0 && (
        <Section className="space-y-2" size="1">
          <Heading as="h4" size="6" align="center">
            {t('heist.objective')}
          </Heading>

          <ol>
            {heist.objectives.map(
              (
                {
                  description,
                  name,
                  optional,
                }: {
                  description: string;
                  name: string;
                  optional: boolean;
                },
                index: number,
              ) => (
                <li
                  className={`relative ${index < heist.objectives.length - 1 ? 'pb-10' : ''}`}
                  key={name}
                >
                  {index < heist.objectives.length - 1 && (
                    <div
                      className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-5"
                      aria-hidden="true"
                    ></div>
                  )}

                  <div className="flex items-start">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span
                        className={`z-10 flex size-8 items-center justify-center rounded-6 border-2 bg-[var(--slate-1)] ${index === 0 ? 'border-accent-9' : 'border-gray-5'}`}
                      >
                        {index === 0 && <span className="size-2.5 rounded-6 bg-accent-9"></span>}
                      </span>
                    </span>
                    <span className="ml-4 flex grow flex-col">
                      <span className="flex text-2 font-medium text-gray-12">
                        {name}{' '}
                        <span className="ml-auto font-regular text-gray-11">
                          {optional ? `(${t('optional')})` : ''}
                        </span>
                      </span>
                      <span className="text-2 text-gray-12">{description}</span>
                    </span>
                  </div>
                </li>
              ),
            )}
          </ol>
        </Section>
      )}
      {/* Assets */}
      {(isHeisterPartOfCrew || (isOwner && HeistVisibilityEnum.Draft === heist.visibility)) &&
        heist.phase === HeistPhaseEnum.Planning && (
          <Section className="space-y-2" size="1">
            {isOwner && HeistVisibilityEnum.Draft === heist.visibility && (
              <>
                <Link
                  className="flex h-8 items-center justify-center rounded-2 bg-accent-9 px-3 !text-[black]"
                  to="edit"
                >
                  {t('edit')}
                </Link>

                <Link
                  className="flex h-8 items-center justify-center rounded-2 bg-accent-9 px-3 !text-[black]"
                  to="assets"
                >
                  {t('asset.type.assets')}
                </Link>
              </>
            )}

            {isHeisterPartOfCrew && (
              <Link
                className="flex h-8 items-center justify-center rounded-2 bg-accent-9 px-3 !text-[black]"
                to="prepare"
              >
                {t('prepare_heist')}
              </Link>
            )}
          </Section>
        )}
      {/* Results */}
      {[HeistPhaseEnum.Succeeded, HeistPhaseEnum.Failed].includes(heist.phase) && (
        <Section className="space-y-2" size="1">
          <Heading as="h4" size="6" align="center">
            {t('results')}
          </Heading>
          <Text as="p" size="5">
            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              heist.crewMembers.edges.reduce((total, { node: { payout } }) => total + payout, 0),
            )}
          </Text>

          <ul className="grid gap-2">
            {heist.crewMembers.edges.map(
              ({
                node: {
                  civilianCasualties,
                  kills,
                  objectivesCompleted,
                  payout,
                  status,
                  user: { id, username },
                },
              }) => (
                <li key={id}>
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Card tabIndex={0}>{username}</Card>
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        className="bg-slate-1"
                        align="end"
                        side="bottom"
                        sideOffset={5}
                      >
                        <Card>
                          <Table.Root>
                            <Table.Body>
                              <Table.Row>
                                <Table.ColumnHeaderCell>
                                  {t('crew_member.civilian_casualties')}
                                </Table.ColumnHeaderCell>
                                <Table.Cell align="right">{civilianCasualties}</Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.ColumnHeaderCell>
                                  {t('crew_member.kills')}
                                </Table.ColumnHeaderCell>
                                <Table.Cell align="right">{kills}</Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.ColumnHeaderCell>
                                  {t('crew_member.objectives_completed')}
                                </Table.ColumnHeaderCell>
                                <Table.Cell align="right">{objectivesCompleted}</Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.ColumnHeaderCell>
                                  {t('crew_member.payout')}
                                </Table.ColumnHeaderCell>
                                <Table.Cell align="right">
                                  {Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                  }).format(payout)}
                                </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.ColumnHeaderCell>
                                  {t('crew_member.status')}
                                </Table.ColumnHeaderCell>
                                <Table.Cell align="right">{status}</Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table.Root>
                        </Card>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </li>
              ),
            )}
          </ul>
        </Section>
      )}
    </>
  );
}
