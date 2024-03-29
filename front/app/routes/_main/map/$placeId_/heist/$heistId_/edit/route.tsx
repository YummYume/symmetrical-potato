import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button, Grid, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getAssets } from '~/lib/api/asset';
import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { getHeist, heistIsMadeBy, heistIsPublic, updateHeist } from '~/lib/api/heist';
import { HeistDifficultyEnum, HeistPreferedTacticEnum, HeistVisibilityEnum } from '~/lib/api/types';
import { getUsers } from '~/lib/api/user';
import { Link } from '~/lib/components/Link';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldInputArray } from '~/lib/components/form/custom/FieldInputArray';
import { FieldMultiSelect } from '~/lib/components/form/custom/FieldMultiSelect';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import dayjs from '~/lib/utils/dayjs';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { formatEnums } from '~/lib/utils/tools';
import { updateHeistResolver } from '~/lib/validators/update-heist';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAccessUnlessGranted, hasRoles } from '~utils/security.server';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { Option } from '~/lib/types/select';
import type { UpdateHeistFormData } from '~/lib/validators/update-heist';
import type { FlashMessage } from '~/root';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);
  const isAdmin = hasRoles(context.user, ROLES.ADMIN);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    const isPublic = await heistIsPublic(context.client, params.heistId);

    if (isPublic) {
      return redirect(`/map/${params.placeId}/heist/${params.heistId}`);
    }

    const { heist } = await getHeist(context.client, params.heistId);

    if (heist.establishment.contractor.id !== user.id && !isAdmin) {
      return redirect(`/map/${params.placeId}/heist/${params.heistId}`);
    }

    // Get the establishments of the current user
    const { establishments } = await getEstablishmentsOfContractor(context.client, user.id);
    const establishmentsIds = establishments.edges.map((edge) => edge.node.id);
    const [{ employees }, { assets }, { users }] = await Promise.all([
      getEmployeesEstablishments(context.client, establishmentsIds),
      getAssets(context.client),
      getUsers(context.client),
    ]);

    return {
      user,
      users,
      heist,
      assets,
      employees,
      establishments,
      placeId: params.placeId,
      locale: context.locale,
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

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);
  const isAdmin = hasRoles(context.user, ROLES.ADMIN);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const isPublic = await heistIsPublic(context.client, params.heistId);

  if (isPublic) {
    return redirect(`/map/${params.placeId}/heist/${params.heistId}`);
  }

  const isMadeBy = await heistIsMadeBy(context.client, {
    id: params.heistId,
    userId: user.id,
  });

  if (!isMadeBy && !isAdmin) {
    throw redirect(`/map/${params.placeId}/heist/${params.heistId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<UpdateHeistFormData>(
    request,
    updateHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  if (data.objectives && data.objectives.length > 20) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.objectives.too_much', { ns: 'flash' }),
      type: 'error',
    } as FlashMessage);

    return json(
      { errors: {} },
      { status: 400, headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }

  try {
    const { startAtTime, startAtDate, shouldEndAtDate, shouldEndAtTime, ...heistData } = data;
    await updateHeist(context.client, {
      ...heistData,
      id: params?.heistId,
      minimumPayout: +heistData.minimumPayout,
      maximumPayout: +heistData.maximumPayout,
      startAt: dayjs(`${startAtDate} ${startAtTime}`).toISOString(),
      shouldEndAt: dayjs(`${shouldEndAtDate} ${shouldEndAtTime}`).toISOString(),
      allowedEmployees: heistData.allowedEmployees.map((allowedEmployee) => allowedEmployee.value),
      forbiddenUsers: heistData.forbiddenUsers?.map((user) => user.value),
      forbiddenAssets: heistData.forbiddenAssets?.map((asset) => asset.value),
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.updated_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}/heist/${params.heistId}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401]);
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
    { errors: {} },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

export default function Edit() {
  const { t } = useTranslation();
  const { placeId, heist, employees, assets, users, user } = useLoaderData<Loader>();
  const usersFormatted = users.edges.reduce<Option[]>((acc, curr) => {
    if (user.id !== curr.node.id) {
      acc.push({
        label: curr.node.username,
        value: curr.node.id,
      });
    }

    return acc;
  }, []);

  const assetsFormatted = assets.edges.reduce<Option[]>((acc, curr) => {
    if (!curr.node.heist) {
      acc.push({
        label: curr.node.name,
        value: curr.node.id,
      });
    }

    return acc;
  }, []);

  const employeesFormatted = employees.edges.reduce<Option[]>((acc, curr) => {
    if (heist.establishment.id === curr.node.establishment.id) {
      acc.push({
        label: curr.node.user.username,
        value: curr.node.id,
      });
    }

    return acc;
  }, []);
  const heistVisibilities = formatEnums(Object.values(HeistVisibilityEnum), 'heist.visibility');
  const heistPreferedTactics = formatEnums(
    Object.values(HeistPreferedTacticEnum),
    'heist.prefered_tactic',
  );
  const heistDifficulties = formatEnums(Object.values(HeistDifficultyEnum), 'heist.difficulty');
  const methods = useRemixForm<UpdateHeistFormData>({
    mode: 'onSubmit',
    resolver: updateHeistResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      name: heist.name,
      description: heist.description,
      startAtDate: dayjs(heist.startAt).format('YYYY-MM-DD'),
      startAtTime: dayjs(heist.startAt).format('HH:mm'),
      shouldEndAtDate: dayjs(heist.shouldEndAt).format('YYYY-MM-DD'),
      shouldEndAtTime: dayjs(heist.shouldEndAt).format('HH:mm'),
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
    <div>
      <Link
        className="flex items-center gap-1 pb-1 pl-2"
        to={`/map/${placeId}/heist/${getUriId(heist.id)}`}
      >
        <span aria-hidden="true">
          <ArrowLeftIcon width="20" height="20" />
        </span>
        {t('back')}
      </Link>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          {t('edit')} - {heist.name}
        </Heading>
      </Dialog.Title>
      <Section className="space-y-3" size="1">
        <RemixFormProvider {...methods}>
          <form
            id="heist-edit-form"
            method="post"
            className="space-y-4"
            onSubmit={methods.handleSubmit}
          >
            <FieldInput name="name" label={t('name')} type="text" required />
            <TextAreaInput name="description" label={t('description')} />
            <Grid columns="2" gap="2">
              <FieldInput name="startAtDate" label={t('heist.start_at.date')} type="date" />
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
            {methods.getValues('visibility') === HeistVisibilityEnum.Public ? (
              <FormAlertDialog
                title={t('heist.edit.confirm')}
                description={t('heist.edit.confirm_description')}
                actionColor="green"
                cancelText={t('cancel')}
                formId="heist-edit-form"
              >
                <Button type="button" color="green">
                  {t('update')}
                </Button>
              </FormAlertDialog>
            ) : (
              <SubmitButton text={t('update')} color="green" />
            )}
          </form>
        </RemixFormProvider>
      </Section>
    </div>
  );
}
