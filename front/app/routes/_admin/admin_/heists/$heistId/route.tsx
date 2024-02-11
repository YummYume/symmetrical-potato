import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button, Flex, Grid, Heading, IconButton, ScrollArea } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getAssets } from '~/lib/api/asset';
import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { getHeist, updateHeist } from '~/lib/api/heist';
import {
  HeistDifficultyEnum,
  HeistPhaseEnum,
  HeistPreferedTacticEnum,
  HeistVisibilityEnum,
} from '~/lib/api/types';
import { getUsers } from '~/lib/api/user';
import { HistoryInfoPopover } from '~/lib/components/HistoryInfoPopover';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { FieldInputArray } from '~/lib/components/form/custom/FieldInputArray';
import { FieldMultiSelect } from '~/lib/components/form/custom/FieldMultiSelect';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { HeistDifficultyBadge } from '~/lib/components/heist/HeistDifficultyBadge';
import { HeistPhaseBadge } from '~/lib/components/heist/HeistPhaseBadge';
import { HeistPreferedTacticBadge } from '~/lib/components/heist/HeistPreferedTacticBadge';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { formatEnums } from '~/lib/utils/tools';
import { adminHeistResolver } from '~/lib/validators/admin/heist';
import { FLASH_MESSAGE_KEY } from '~/root';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import dayjs from '~utils/dayjs';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { Option } from '~/lib/types/select';
import type { AdminHeistFormData } from '~/lib/validators/admin/heist';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.heistId) {
    throw redirect('/admin/heists');
  }

  try {
    const t = await i18next.getFixedT(request, 'admin');
    const { heist } = await getHeist(context.client, params.heistId, true);
    // Get the establishments of heist's contractor
    const { establishments } = await getEstablishmentsOfContractor(
      context.client,
      heist.establishment.contractor.id,
    );
    const establishmentsIds = establishments.edges.map((edge) => edge.node.id);
    const [{ employees }, { assets }, { users }] = await Promise.all([
      getEmployeesEstablishments(context.client, establishmentsIds),
      getAssets(context.client),
      getUsers(context.client),
    ]);

    return {
      users,
      heist,
      assets,
      employees,
      establishments,
      meta: {
        title: t('meta.heists_edit.title', {
          ns: 'admin',
        }),
        description: t('meta.heists_edit.description', {
          ns: 'admin',
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'heist')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'heist.not_found',
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

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.heistId) {
    throw redirect('/admin/heists');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { heist } = await getHeist(context.client, params.heistId, true);

  if (heist.phase !== HeistPhaseEnum.Planning) {
    throw redirect(`/admin/heists/${params.heistId}`);
  }

  const { errors, data, receivedValues } = await getValidatedFormData<AdminHeistFormData>(
    request,
    adminHeistResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    const { startAtTime, startAtDate, shouldEndAtDate, shouldEndAtTime, ...heistData } = data;
    await updateHeist(context.client, {
      ...heistData,
      id: params?.heistId,
      minimumPayout: +heistData.minimumPayout,
      maximumPayout: +heistData.maximumPayout,
      startAt: dayjs(`${startAtDate} ${startAtTime}`).toISOString(),
      shouldEndAt: dayjs(`${shouldEndAtDate} ${shouldEndAtTime}`).utc(false).toISOString(),
      allowedEmployees: heistData.allowedEmployees.map((allowedEmployee) => allowedEmployee.value),
      forbiddenUsers: heistData.forbiddenUsers?.map((user) => user.value),
      forbiddenAssets: heistData.forbiddenAssets?.map((asset) => asset.value),
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.updated_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return json(
      {},
      {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 404])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 404]);
    } else {
      throw error;
    }
  }

  if (errorMessage) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: errorMessage,
      type: 'error',
    } as FlashMessage);
  }

  return json(
    { errors: {}, receivedValues },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

export default function EditHeist() {
  const { heist, employees, assets, users } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const heistVisibilities = formatEnums(Object.values(HeistVisibilityEnum), 'heist.visibility');
  const heistPreferedTactics = formatEnums(
    Object.values(HeistPreferedTacticEnum),
    'heist.prefered_tactic',
  );
  const heistDifficulties = formatEnums(Object.values(HeistDifficultyEnum), 'heist.difficulty');
  const usersFormatted = users.edges.reduce<Option[]>((acc, curr) => {
    acc.push({
      label: curr.node.username,
      value: curr.node.id,
    });

    return acc;
  }, []);
  const assetsFormatted: Option[] = assets.edges.map((edge) => ({
    label: edge.node.name,
    value: edge.node.id,
  }));
  const employeesFormatted = employees.edges.reduce<Option[]>((acc, curr) => {
    if (heist.establishment.id === curr.node.establishment.id) {
      acc.push({
        label: curr.node.user.username,
        value: curr.node.id,
      });
    }

    return acc;
  }, []);
  const methods = useRemixForm<AdminHeistFormData>({
    mode: 'onSubmit',
    resolver: adminHeistResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    disabled: heist.phase !== HeistPhaseEnum.Planning,
    defaultValues: {
      name: heist.name,
      description: heist.description,
      startAtDate: dayjs(heist.startAt).utc(false).format('YYYY-MM-DD'),
      startAtTime: dayjs(heist.startAt).utc(false).format('HH:mm'),
      shouldEndAtDate: dayjs(heist.shouldEndAt).utc(false).format('YYYY-MM-DD'),
      shouldEndAtTime: dayjs(heist.shouldEndAt).utc(false).format('HH:mm'),
      preferedTactic: heist.preferedTactic,
      difficulty: heist.difficulty,
      minimumPayout: heist.minimumPayout,
      maximumPayout: heist.maximumPayout,
      allowedEmployees: heist.allowedEmployees.edges.map((edge) => ({
        value: edge.node.id,
        label: edge.node.user.username,
      })),
      forbiddenUsers: heist.forbiddenUsers.edges.map((edge) => ({
        value: edge.node.id,
        label: edge.node.username,
      })),
      forbiddenAssets: heist.forbiddenAssets.edges.map((edge) => ({
        value: edge.node.id,
        label: edge.node.name,
      })),
      visibility: heist.visibility,
      objectives: heist.objectives.map(
        (objective: { name: string; description: string; optional?: boolean }) => ({
          ...objective,
          optional: objective.optional ?? false,
        }),
      ),
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">{heist.name}</Heading>
          <HeistPhaseBadge phase={heist.phase} />
          <HeistDifficultyBadge difficulty={heist.difficulty} />
          <HeistPreferedTacticBadge preferedTactic={heist.preferedTactic} />
        </Flex>
        <HistoryInfoPopover
          createdAt={heist.createdAt}
          createdBy={heist.createdBy?.username}
          updatedAt={heist.updatedAt}
          updatedBy={heist.updatedBy?.username}
        >
          <IconButton aria-label={t('history_info')} size="2" variant="soft" radius="full">
            <InfoCircledIcon width="18" height="18" />
          </IconButton>
        </HistoryInfoPopover>
      </Flex>
      <div className="h-[23.875rem]">
        <ScrollArea type="auto" scrollbars="both">
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="panel__content-form"
              onSubmit={methods.handleSubmit}
              id="heist-form"
            >
              <FieldInput name="name" label={t('name')} type="text" required />
              <TextAreaInput name="description" label={t('description')} />
              <Grid columns="2" gap="2">
                <FieldInput
                  name="startAtDate"
                  label={t('heist.start_at.date')}
                  type="date"
                  required
                />
                <FieldInput name="startAtTime" label={t('heist.start_at.time')} type="time" />
              </Grid>
              <Grid columns="2" gap="2">
                <FieldInput
                  name="shouldEndAtDate"
                  label={t('heist.should_end_at.date')}
                  type="date"
                />
                <FieldInput
                  name="shouldEndAtTime"
                  label={t('heist.should_end_at.time')}
                  type="time"
                />
              </Grid>
              <Grid columns="2" gap="2">
                <FieldInput name="minimumPayout" label={t('heist.minimum_payout')} type="number" />
                <FieldInput name="maximumPayout" label={t('heist.maximum_payout')} type="number" />
              </Grid>
              <FieldMultiSelect
                name="allowedEmployees"
                label={t('heist.allowed_employees')}
                options={employeesFormatted}
              />
              <FieldMultiSelect
                name="forbiddenUsers"
                label={t('heist.forbidden_users')}
                options={usersFormatted}
              />
              <FieldMultiSelect
                name="forbiddenAssets"
                label={t('heist.forbidden_assets')}
                options={assetsFormatted}
              />
              <FieldSelect
                name="preferedTactic"
                label={t('heist.prefered_tactic')}
                options={heistPreferedTactics}
              />
              <FieldSelect
                name="difficulty"
                label={t('heist.difficulty')}
                options={heistDifficulties}
              />
              <FieldSelect
                name="visibility"
                label={t('heist.visibility')}
                options={heistVisibilities}
              />
              <FieldInputArray
                name="objectives"
                label={t('heist.objective')}
                limit={20}
                disabled={heist.phase !== HeistPhaseEnum.Planning}
                config={{
                  defaultAppendValue: {
                    name: '',
                    description: '',
                    optional: false,
                  },
                  add: {
                    text: t('heist.add_objective'),
                  },
                  fields: [
                    {
                      name: 'name',
                      label: t('name'),
                      type: 'text',
                    },
                    {
                      name: 'description',
                      label: t('description'),
                      type: 'text',
                    },
                    {
                      name: 'optional',
                      label: t('optional'),
                      type: 'checkbox',
                    },
                  ],
                }}
              />
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        <Flex align="center" gap="4">
          <FormConfirmDialog
            formId="heist-delete"
            title={t('delete')}
            description={t('heist.delete.confirm', {
              ns: 'admin',
            })}
            action="delete"
          >
            <Button type="button" color="red">
              {t('delete')}
            </Button>
          </FormConfirmDialog>
        </Flex>
        {heist.phase === HeistPhaseEnum.Planning ? (
          <SubmitButton
            form="heist-form"
            color="green"
            text={t('save')}
            submittingText={t('saving')}
          />
        ) : (
          <div />
        )}
      </Flex>
    </Flex>
  );
}
