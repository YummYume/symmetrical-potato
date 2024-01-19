import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getAssets } from '~/lib/api/asset';
import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { getHeist, updateHeist } from '~/lib/api/heist';
import { HeistDifficultyEnum, HeistPreferedTacticEnum, HeistVisibilityEnum } from '~/lib/api/types';
import { getUsersByRoles } from '~/lib/api/user';
import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldInputArray } from '~/lib/components/form/custom/FieldInputArray';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import dayjs from '~/lib/utils/dayjs';
import { updateHeistResolver } from '~/lib/validators/updateHeist';
import { FLASH_MESSAGE_KEY } from '~/root';
import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { UpdateHeistFormData } from '~/lib/validators/updateHeist';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  // Get the establishments of the current user
  const { establishments } = await getEstablishmentsOfContractor(context.client, user.id);
  const establishmentsIds = establishments.edges.map((edge) => edge.node.id);

  // Get the current heist
  const { heist } = await getHeist(context.client, params.heistId);

  const { employees } = await getEmployeesEstablishments(context.client, establishmentsIds);
  const { assets } = await getAssets(context.client);

  const { users } = await getUsersByRoles(context.client, {
    include: 'ROLE_HEISTER',
    exclude: ['ROLE_ADMIN'],
  });

  // Redirect if the heist is not owned by a establishment of the current user
  if (establishments.edges.find((edge) => edge.node.id === heist.establishment.id) === undefined) {
    throw redirect(`/map/${params.placeId}`);
  }

  return {
    heist,
    users,
    assets,
    employees,
    establishments,
    placeId: params.placeId,
    locale: context.locale,
  };
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  const t = await i18next.getFixedT(request, ['heist', 'validators', 'flash']);
  const { errors, data } = await getValidatedFormData<UpdateHeistFormData>(
    request,
    updateHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  if (!params?.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  try {
    await updateHeist(context.client, {
      id: params?.heistId,
      name: data.name,
      description: data.description,
      minimumPayout: +data.minimumPayout,
      maximumPayout: +data.maximumPayout,
      minimumRequiredRating: +(data?.minimumRequiredRating ?? 0),
      startAt: dayjs(`${data.startAtDate} ${data.startAtTime}`).toISOString(),
      shouldEndAt: dayjs(`${data.shouldEndAtDate} ${data.shouldEndAtTime}`).toISOString(),
      difficulty: data.difficulty.value,
      preferedTactic: data.preferedTactic.value,
      visibility: HeistVisibilityEnum.Draft,
      allowedEmployees: data.allowedEmployees.map((allowedEmployee) => allowedEmployee.value),
      forbiddenUsers: data.forbiddenUsers?.map((user) => user.value),
      forbiddenAssets: data.forbiddenAssets?.map((asset) => asset.value),
      objectives: data.objectives,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.updated_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}`, {
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

type Option = { label: string; value: string };

export default function Edit() {
  const { t } = useTranslation();
  const { placeId, heist, employees, assets, users } = useLoaderData<Loader>();

  const usersFormatted: Option[] = users.edges.map((edge) => ({
    label: edge.node.username,
    value: edge.node.id,
  }));

  const assetsFormatted: Option[] = assets.edges.map((edge) => ({
    label: edge.node.name,
    value: edge.node.id,
  }));

  const employeesFormatted = employees.edges.reduce((acc, curr) => {
    if (heist.establishment.id === curr.node.establishment.id) {
      acc.push({
        label: curr.node.user.username,
        value: curr.node.id,
      });
    }

    return acc;
  }, [] as Option[]);

  const heistPreferedTactics: Option[] = Object.values(HeistPreferedTacticEnum).map(
    (value: string) => ({
      label: value,
      value,
    }),
  );

  const heistDifficulties: Option[] = Object.values(HeistDifficultyEnum).map((value: string) => ({
    label: value,
    value,
  }));

  const methods = useRemixForm<UpdateHeistFormData>({
    mode: 'onSubmit',
    resolver: updateHeistResolver,
    defaultValues: {
      name: heist.name,
      description: heist.description,
      startAtDate: dayjs(heist.startAt).format('YYYY-MM-DD'),
      startAtTime: dayjs(heist.startAt).format('HH:mm'),
      shouldEndAtDate: dayjs(heist.shouldEndAt).format('YYYY-MM-DD'),
      shouldEndAtTime: dayjs(heist.shouldEndAt).format('HH:mm'),
      preferedTactic: {
        value: heist.preferedTactic,
      },
      difficulty: {
        value: heist.difficulty,
      },
      minimumPayout: heist.minimumPayout,
      maximumPayout: heist.maximumPayout,
      minimumRequiredRating: heist.minimumRequiredRating,
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
      visibility: {
        value: heist.visibility,
      },
      objectives: heist.objectives,
    },
  });

  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          Edit {heist.name}
        </Heading>
      </Dialog.Title>
      <Section className="space-y-3" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput name="name" label={t('name')} type="text" />
            <FieldInput name="description" label={t('description')} type="text" />
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
            <FieldInput
              name="minimumRequiredRating"
              label={t('heist.minimum_required_rating')}
              type="number"
              min={0}
              max={5}
            />
            <FieldSelect
              name="allowedEmployees"
              label={t('heist.allowed_employees')}
              options={employeesFormatted}
              isMulti
            />
            <FieldSelect
              name="forbiddenUsers"
              label={t('heist.forbidden_users')}
              options={usersFormatted}
              isMulti
            />
            <FieldSelect
              name="forbiddenAssets"
              label={t('heist.forbidden_assets')}
              options={assetsFormatted}
              isMulti
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
              options={heistDifficulties}
            />
            <FieldInputArray
              name="objectives"
              label={t('heist.objective')}
              config={{
                defaultAppendValue: {
                  name: '',
                  description: '',
                },
                add: {
                  text: t('heist.add_objective', { ns: 'heist' }),
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
                ],
              }}
            />
            <SubmitButton text={t('update')} />
          </form>
        </RemixFormProvider>
        <Link to={`/map/${placeId}`}>{t('back')}</Link>
      </Section>
    </div>
  );
}
