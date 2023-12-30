import * as Dialog from '@radix-ui/react-dialog';
import { Button, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getEstablishmentsOfContractor } from '~/lib/api/establishment';
import { createHeist } from '~/lib/api/heist';
import { HeistDifficultyEnum, HeistPreferedTacticEnum, HeistVisibilityEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { createHeistResolver } from '~/lib/validators/createHeist';
import { FLASH_MESSAGE_KEY } from '~/root';
import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { CreateHeistFormData } from '~/lib/validators/createHeist';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  const response = await getEstablishmentsOfContractor(context.client, user.id);

  return {
    establishments: response.establishments,
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
      startAt: data.startAt.toISOString(),
      shouldEndAt: data.shouldEndAt.toISOString(),
      visibility: HeistVisibilityEnum.Draft,
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

export default function Add() {
  const { t } = useTranslation();
  const [objectivesFields, setObjectivesFields] = useState<string[]>([]);
  const [counter, setCounter] = useState<number>(0);
  const { placeId, establishments } = useLoaderData<Loader>();

  const addObjective = () => {
    setObjectivesFields((prev) => [...prev, `objectives[${counter}]`]);
    setCounter((prev) => prev + 1);
  };

  const removeObjective = (field: string) => {
    setObjectivesFields((prev) => prev.filter((f) => f !== field));
    setCounter((prev) => prev - 1);
  };

  const methods = useRemixForm<CreateHeistFormData>({
    mode: 'onSubmit',
    resolver: createHeistResolver,
  });
  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          Add
        </Heading>
      </Dialog.Title>
      <Section className="space-y-3" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput name="name" label={t('name')} type="text" />
            <FieldInput name="description" label={t('description')} type="text" />
            <FieldInput name="startAt" label={t('start_at')} type="datetime-local" />
            <FieldInput name="shouldEndAt" label={t('heist.should_end_at')} type="datetime-local" />
            <FieldInput name="minimumPayout" label={t('heist.minimum_payout')} type="number" />
            <FieldInput name="maximumPayout" label={t('heist.maximum_payout')} type="number" />
            <FieldSelect name="establishment" label={t('establishment')}>
              <>
                {establishments.edges.map((edge) => {
                  return (
                    <option key={edge.node.id} value={edge.node.id}>
                      {edge.node.name}
                    </option>
                  );
                })}
              </>
            </FieldSelect>
            <FieldSelect name="preferedTactic" label={t('heist.prefered_tactic')}>
              <>
                {Object.entries(HeistPreferedTacticEnum).map(([key, value]) => {
                  return (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  );
                })}
              </>
            </FieldSelect>
            <FieldSelect name="difficulty" label={t('heist.difficulty')}>
              <>
                {Object.entries(HeistDifficultyEnum).map(([key, value]) => {
                  return (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  );
                })}
              </>
            </FieldSelect>
            {objectivesFields.map((field, key) => (
              <div key={field}>
                <FieldInput name={field} label={`${t('heist.objective')} ${key + 1}`} />
                <Button type="button" onClick={() => removeObjective(field)}>
                  {t('delete')}
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addObjective}>
              {t('heist.add_objective', { ns: 'heist' })}
            </Button>
            <SubmitButton text={t('create')} />
          </form>
        </RemixFormProvider>
        <Link to={`/map/${placeId}`}>{t('back')}</Link>
      </Section>
    </div>
  );
}
