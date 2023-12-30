import * as Dialog from '@radix-ui/react-dialog';
import { Button, Heading, Section } from '@radix-ui/themes';
import { type DataFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
// import { i18next } from '~/lib/i18n/index.server';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { commitSession, getSession } from '~/lib/session.server';
import { createHeistResolver } from '~/lib/validators/createHeist';
import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { CreateHeistFormData } from '~/lib/validators/createHeist';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);
  return {
    placeId: params.placeId,
    locale: context.locale,
  };
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  // const t = await i18next.getFixedT(request, ['heist', 'validators']);
  const { errors, data } = await getValidatedFormData<CreateHeistFormData>(
    request,
    createHeistResolver,
  );

  console.log(data);

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  // let errorMessage: string | null = null;

  return json(
    { errors: {} },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export default function Add() {
  const [objectivesFields, setObjectivesFields] = useState<string[]>([]);
  const [counter, setCounter] = useState<number>(0);
  const { placeId } = useLoaderData<Loader>();

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
            <FieldInput name="name" label="Name" />
            <FieldInput name="description" label="Description" />
            <FieldInput name="startAt" label="Start At" type="datetime-local" />
            <FieldInput name="shouldEndAt" label="Should End At" type="datetime-local" />
            <FieldInput name="minimumPayout" label="Minimum Payout" type="number" />
            <FieldInput name="maximumPayout" label="Maximum Payout" type="number" />
            <FieldInput name="establishement" label="Establishement" />
            <FieldSelect name="preferedTactic" label="Prefered Tactic">
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
            <FieldSelect name="difficulty" label="Difficulty">
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
                <FieldInput name={field} label={`Objective ${key + 1}`} />
                <Button type="button" onClick={() => removeObjective(field)}>
                  remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addObjective}>
              add objective
            </Button>
            <SubmitButton text="Add" />
          </form>
        </RemixFormProvider>
        <Link to={`/map/${placeId}`}>retour</Link>
      </Section>
    </div>
  );
}
