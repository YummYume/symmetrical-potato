import * as Dialog from '@radix-ui/react-dialog';
import { Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { createHeist } from '~/lib/api/heist';
import { HeistDifficultyEnum, HeistPreferedTacticEnum, HeistVisibilityEnum } from '~/lib/api/types';
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
import type { FormEvent } from 'react';
import type { CreateHeistFormData } from '~/lib/validators/createHeist';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  // Get the establishments of the current user
  const { establishments } = await getEstablishmentsOfContractor(context.client, user.id);
  const establishmentsIds = establishments.edges.map((edge) => edge.node.id);

  establishmentsIds.push('/establishments/1eeb2ebb-daaf-6cca-9d1e-f71b5fde5239');

  const { employees } = await getEmployeesEstablishments(context.client, establishmentsIds);

  return {
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
      ...data,
      startAt: data.startAt,
      shouldEndAt: data.shouldEndAt,
      visibility: HeistVisibilityEnum.Draft,
      allowedEmployees: data.allowedEmployees.map((allowedEmployee) => allowedEmployee.value),
      objectives: data.objectives ?? [],
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
  const { placeId, establishments, employees } = useLoaderData<Loader>();

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

  employeesFormatted.push({
    establishmentId: '/establishments/1eeb2ebb-dab0-60da-b388-f71b5fde5239',
    label: 'bobby',
    value: '/employees/1eeb2ebb-daaf-6cca-9d1e-f71b5fde52zz9',
  });

  establishmentsFormatted.push({
    label: 'bob parc',
    value: '/establishments/1eeb2ebb-daaf-6cca-9d1e-f71b5fde5239',
  });

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

  // TODO: find solution date now in dayjs
  const dateNow = dayjs();
  const startAt = dateNow.add(15, 'minutes').toISOString().slice(0, -8);
  const shouldEndAt = dateNow.add(30, 'minutes').toISOString().slice(0, -8);

  const methods = useRemixForm<CreateHeistFormData>({
    mode: 'onSubmit',
    resolver: createHeistResolver,
    submitHandlers: {
      onInvalid: async (errors) => {
        console.error('errors:', errors);
        console.log(methods.getValues());
      },
      onValid: async (data) => {
        console.error('data:', data);
      },
    },
    defaultValues: {
      startAt,
      shouldEndAt,
      establishment: establishments.edges[0].node.id,
      preferedTactic: HeistPreferedTacticEnum.Loud,
      difficulty: HeistDifficultyEnum.Normal,
      minimumPayout: 100000,
      maximumPayout: 1000000,
      allowedEmployees: [],
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
  }, [watchEstablishment]);

  const handleSubmit: <T extends HTMLFormElement>(e: FormEvent<T>) => Promise<void> = async (e) => {
    e.preventDefault();

    let $form = e.currentTarget;
    let formData = new FormData($form);
    console.log(formData);

    return await methods.handleSubmit(e);
  };

  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          Add
        </Heading>
      </Dialog.Title>
      <Section className="space-y-3" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="space-y-4" onSubmit={handleSubmit}>
            <FieldInput name="name" label={t('name')} type="text" />
            <FieldInput name="description" label={t('description')} type="text" />
            <FieldInput name="startAt" label={t('start_at')} type="datetime-local" />
            <FieldInput name="shouldEndAt" label={t('heist.should_end_at')} type="datetime-local" />
            <FieldInput name="minimumPayout" label={t('heist.minimum_payout')} type="number" />
            <FieldInput name="maximumPayout" label={t('heist.maximum_payout')} type="number" />
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
