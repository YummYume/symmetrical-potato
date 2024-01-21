import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getAssets } from '~/lib/api/asset';
import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { createHeist } from '~/lib/api/heist';
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
import { createHeistResolver } from '~/lib/validators/createHeist';
import { FLASH_MESSAGE_KEY } from '~/root';
import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { CreateHeistFormData } from '~/lib/validators/createHeist';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  // Get the establishments of the current user
  const { establishments } = await getEstablishmentsOfContractor(context.client, user.id);
  const establishmentsIds = establishments.edges.map((edge) => edge.node.id);

  const { employees } = await getEmployeesEstablishments(context.client, establishmentsIds);
  const { assets } = await getAssets(context.client);

  const { users } = await getUsersByRoles(context.client, {
    include: 'ROLE_HEISTER',
    exclude: ['ROLE_ADMIN'],
  });

  return {
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
  const { errors, data } = await getValidatedFormData<CreateHeistFormData>(
    request,
    createHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  try {
    await createHeist(context.client, {
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
      establishment: data.establishment.value,
      allowedEmployees: data.allowedEmployees.map((allowedEmployee) => allowedEmployee.value),
      forbiddenAssets: data.forbiddenAssets?.map((asset) => asset.value),
      objectives: data.objectives,
      placeId: params.placeId,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.created_successfully', { ns: 'flash' }),
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

export default function Add() {
  const { t } = useTranslation();
  const { placeId, establishments, employees, assets, users } = useLoaderData<Loader>();

  const usersFormatted: Option[] = users.edges.map((edge) => ({
    label: edge.node.username,
    value: edge.node.id,
  }));

  const assetsFormatted: Option[] = assets.edges.map((edge) => ({
    label: edge.node.name,
    value: edge.node.id,
  }));

  const employeesFormatted: (Option & { establishmentId: string })[] = employees.edges.map(
    (edge) => ({
      establishmentId: edge.node.establishment.id,
      label: edge.node.user.username,
      value: edge.node.id,
    }),
  );

  const establishmentsFormatted: Option[] = establishments.edges.map((edge) => ({
    label: edge.node.name,
    value: edge.node.id,
  }));

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

  const dateNow = dayjs();
  const startAt = dateNow.add(15, 'minutes');
  const shouldEndAt = startAt.add(15, 'minutes');

  const methods = useRemixForm<CreateHeistFormData>({
    mode: 'onSubmit',
    resolver: createHeistResolver,
    defaultValues: {
      startAtDate: startAt.format('YYYY-MM-DD'),
      startAtTime: startAt.format('HH:mm'),
      shouldEndAtDate: shouldEndAt.format('YYYY-MM-DD'),
      shouldEndAtTime: shouldEndAt.format('HH:mm'),
      establishment: {
        value: establishments.edges[0].node.id,
      },
      preferedTactic: {
        value: HeistPreferedTacticEnum.Loud,
      },
      difficulty: {
        value: HeistDifficultyEnum.Normal,
      },
      minimumPayout: 100000,
      maximumPayout: 1000000,
      minimumRequiredRating: 0,
      allowedEmployees: [],
      forbiddenUsers: [],
      forbiddenAssets: [],
      objectives: [],
    },
  });

  // Watch when the establishment changes to update the employees options
  const watchEstablishment = methods.watch('establishment') as Option | string;

  // Get the current establishment (string or Option)
  const currentEstablishment =
    typeof watchEstablishment === 'string' ? watchEstablishment : watchEstablishment?.value;

  // Get the employees of the current establishment
  const [allowedEmployeesOptions, setAllowedEmployeesOptions] = useState<
    (Option & { establishmentId: string })[]
  >(employeesFormatted.filter((employee) => employee.establishmentId === currentEstablishment));

  // Update the employees options when the establishment changes
  useEffect(() => {
    setAllowedEmployeesOptions(
      employeesFormatted.filter((employee) => employee.establishmentId === currentEstablishment),
    );

    methods.setValue('allowedEmployees', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchEstablishment]);

  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          {t('add')}
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
              name="establishment"
              label={t('establishment')}
              options={establishmentsFormatted}
            />
            <FieldSelect
              name="allowedEmployees"
              label={t('heist.allowed_employees')}
              options={allowedEmployeesOptions}
              isMulti
              isDisabled={!watchEstablishment}
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
            <SubmitButton text={t('create')} />
          </form>
        </RemixFormProvider>
        <Link to={`/map/${placeId}`}>{t('back')}</Link>
      </Section>
    </div>
  );
}
