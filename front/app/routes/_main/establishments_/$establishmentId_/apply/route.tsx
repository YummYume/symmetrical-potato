import { ArrowLeftIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Container, Flex, Heading } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { createEmployee } from '~/lib/api/employee';
import { getEstablishment } from '~/lib/api/establishment';
import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInputArray } from '~/lib/components/form/custom/FieldInputArray';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import { DAYS } from '~/lib/utils/days';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';
import { createEmployeeResolver } from '~/lib/validators/employee';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import type { Schedule } from '~/lib/utils/days';
import type { CreateEmployeeFormData } from '~/lib/validators/employee';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw new Response(null, {
      status: 404,
      statusText: 'establishment.not_found',
    });
  } else if (!hasRoles(user, [ROLES.HEISTER]) || user.employee) {
    throw redirect(`/establishments/${params.establishmentId}`);
  }

  try {
    const { establishment } = await getEstablishment(context.client, params.establishmentId);
    const t = await i18next.getFixedT(request, 'common');

    return json({
      establishment,
      meta: {
        title: t('meta.establishment_apply.title'),
        description: t('meta.establishment_apply.description', {
          name: establishment.name,
        }),
      },
    });
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'user')) {
      throw e;
    }
  }

  throw new Response(null, {
    status: 404,
    statusText: 'establishment_apply.not_found',
  });
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw new Response(null, {
      status: 404,
      statusText: 'establishment.not_found',
    });
  } else if (!hasRoles(user, [ROLES.HEISTER]) || user.employee) {
    throw redirect(`/establishments/${params.establishmentId}`);
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<CreateEmployeeFormData>(
    request,
    createEmployeeResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    const weeklySchedule: Schedule = data.weeklySchedule.reduce(
      (acc, { startAt, endAt, day }) => {
        acc[day] = [...acc[day], { startAt, endAt }];

        return acc;
      },
      {
        [DAYS.MONDAY]: [],
        [DAYS.TUESDAY]: [],
        [DAYS.WEDNESDAY]: [],
        [DAYS.THURSDAY]: [],
        [DAYS.FRIDAY]: [],
        [DAYS.SATURDAY]: [],
        [DAYS.SUNDAY]: [],
      },
    );

    await createEmployee(context.client, {
      ...data,
      establishment: `/establishments/${params.establishmentId}`,
      weeklySchedule,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('job.created', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/job', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
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

export default function Profile() {
  const { t } = useTranslation();
  const { establishment } = useLoaderData<Loader>();
  const methods = useRemixForm<CreateEmployeeFormData>({
    mode: 'onSubmit',
    resolver: createEmployeeResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      weeklySchedule: [],
    },
  });
  const daysOptions = Object.entries(DAYS).map(([label, value]) => ({
    value,
    label: `day.${label.toLowerCase()}`,
  }));

  return (
    <main className="py-10">
      <Container size="2">
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('establishment.apply_to', { name: establishment.name })}
          </Heading>

          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="flex flex-col items-center gap-5"
              onSubmit={methods.handleSubmit}
            >
              <Flex width="100%" direction="column" gap="3">
                <Link className="flex items-center gap-1 pb-1 pl-2" to="/establishments">
                  <span aria-hidden="true">
                    <ArrowLeftIcon width="20" height="20" />
                  </span>
                  {t('back')}
                </Link>
                <TextAreaInput name="motivation" label={t('employee.motivation')} rows={12} />
                <Callout.Root color="cyan">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {t('establishment.apply.minimum_hours', {
                      hours: establishment.minimumWorkTimePerWeek,
                    })}
                  </Callout.Text>
                </Callout.Root>
                <FieldInputArray
                  name="weeklySchedule"
                  label={t('employee.schedule')}
                  limit={50}
                  config={{
                    defaultAppendValue: {
                      startAt: '',
                      endAt: '',
                      day: daysOptions.at(0)?.value,
                    },
                    add: {
                      text: t('employee.schedule.add'),
                    },
                    fields: [
                      {
                        name: 'startAt',
                        label: t('employee.schedule.start_at'),
                        type: 'time',
                      },
                      {
                        name: 'endAt',
                        label: t('employee.schedule.end_at'),
                        type: 'time',
                      },
                      {
                        name: 'day',
                        label: t('employee.schedule.day'),
                        type: 'select',
                        options: daysOptions,
                      },
                    ],
                  }}
                />
              </Flex>

              <Flex justify="end" align="center" gap="4" className="mt-auto" role="group">
                <SubmitButton
                  className="min-w-32 max-w-full"
                  text={t('send')}
                  submittingText={t('sending')}
                />
              </Flex>
            </form>
          </RemixFormProvider>
        </Flex>
      </Container>
    </main>
  );
}
