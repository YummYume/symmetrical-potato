import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import {
  Blockquote,
  Button,
  Callout,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { updateEmployee } from '~/lib/api/employee';
import { EmployeeStatusEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { EmployeeScheduleList } from '~/lib/components/employee/EmployeeScheduleList';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { updateEmployeeResolver } from '~/lib/validators/employee';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { UpdateEmployeeFormData } from '~/lib/validators/employee';
import type { FlashMessage } from '~/root';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER, ROLES.EMPLOYEE]);
  const t = await i18next.getFixedT(request, 'common');

  return json({
    user,
    meta: {
      title: t('meta.my_job.title'),
      description: t('meta.my_job.description'),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER, ROLES.EMPLOYEE]);
  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<UpdateEmployeeFormData>(
    request,
    updateEmployeeResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateEmployee(context.client, {
      ...data,
      id: `/employees/${getUriId(user.employee.id)}`,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('job.updated', { ns: 'flash' }),
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

export default function Job() {
  const { t } = useTranslation();
  const { user } = useLoaderData<Loader>();
  const methods = useRemixForm<UpdateEmployeeFormData>({
    mode: 'onSubmit',
    resolver: updateEmployeeResolver,
    disabled: user.employee.status !== EmployeeStatusEnum.Active,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      description: user.employee.description ?? '',
    },
  });

  return (
    <main className="px-4 py-10 lg:px-0">
      <Container size="3">
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_job')}
          </Heading>
          <div className="text-center">
            <Flex justify="center" align="center" direction="column" gap="3">
              {!user.employee && (
                <>
                  <InfoCircledIcon aria-hidden="true" width="46" height="46" />
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t('my_job.no_job')}
                    </Heading>
                    <Text as="p" mt="2">
                      {t('my_job.no_job.description')}
                    </Text>
                  </div>
                  <Callout.Root color="orange">
                    <Callout.Icon>
                      <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>{t('my_job.warning_message')}</Callout.Text>
                  </Callout.Root>
                  <div className="mt-6">
                    <Link
                      to="/establishments"
                      unstyled
                      data-accent-color="green"
                      className="rt-reset rt-BaseButton rt-Button rt-r-size-2 rt-variant-surface"
                    >
                      {t('my_job.find_establishment')}
                    </Link>
                  </div>
                </>
              )}
              {user.employee && (
                <>
                  {user.employee.status === EmployeeStatusEnum.Pending && (
                    <QuestionMarkCircledIcon aria-hidden="true" width="46" height="46" />
                  )}
                  {user.employee.status === EmployeeStatusEnum.Active && (
                    <CheckCircledIcon
                      aria-hidden="true"
                      className="text-green-10"
                      width="46"
                      height="46"
                    />
                  )}
                  {user.employee.status === EmployeeStatusEnum.Rejected && (
                    <CrossCircledIcon
                      aria-hidden="true"
                      className="text-red-10"
                      width="46"
                      height="46"
                    />
                  )}
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t(`my_job.status.${user.employee.status.toLowerCase()}`)}
                    </Heading>
                    <Text as="p" mt="2">
                      {t(`my_job.status_description.${user.employee.status.toLowerCase()}`)}
                    </Text>
                  </div>
                  {user.employee.status === EmployeeStatusEnum.Pending && (
                    <Callout.Root color="orange">
                      <Callout.Icon>
                        <ExclamationTriangleIcon />
                      </Callout.Icon>
                      <Callout.Text>{t('my_job.warning_message')}</Callout.Text>
                    </Callout.Root>
                  )}
                  <Flex mt="6" direction="column" gap="3">
                    <Grid columns={{ initial: '1', md: '2' }} gap={{ initial: '2', md: '9' }}>
                      <Flex direction="column" gap="2">
                        <Flex className="text-left" direction="column" gap="1">
                          <Text weight="bold" size="3" color="gray">
                            {t('establishment')}
                          </Text>
                          <Link to={`/establishments/${getUriId(user.employee.establishment.id)}`}>
                            {user.employee.establishment.name}
                          </Link>
                        </Flex>
                        {user.employee.motivation && (
                          <Flex className="text-left" direction="column" gap="1">
                            <Text weight="bold" size="3" color="gray">
                              {t('employee.motivation')}
                            </Text>
                            <Blockquote>{user.employee.motivation}</Blockquote>
                          </Flex>
                        )}
                      </Flex>
                      <Flex className="text-left" direction="column" gap="1">
                        <Text weight="bold" size="3" color="gray">
                          {t('employee.schedule')}
                        </Text>
                        <EmployeeScheduleList schedule={user.employee.weeklySchedule} />
                      </Flex>
                    </Grid>
                    {user.employee.status === EmployeeStatusEnum.Active && (
                      <RemixFormProvider {...methods}>
                        <form
                          onSubmit={methods.handleSubmit}
                          id="employee-form"
                          className="text-left"
                        >
                          <TextAreaInput
                            name="description"
                            label={t('employee.description')}
                            rows={5}
                          />
                        </form>
                      </RemixFormProvider>
                    )}
                    <Flex
                      justify="center"
                      align="center"
                      gap="2"
                      direction={{ initial: 'column', sm: 'row' }}
                    >
                      <Form
                        id="employee-delete-form"
                        action="delete"
                        method="post"
                        className="hidden"
                        unstable_viewTransition
                      />
                      <FormAlertDialog
                        title={t('delete')}
                        description={
                          user.employee.status === EmployeeStatusEnum.Active
                            ? t('my_job.delete.confirm')
                            : t('my_job.delete.confirm_stop_application')
                        }
                        formId="employee-delete-form"
                      >
                        <Button type="button" color="red" className="w-fit">
                          {t('delete')}
                        </Button>
                      </FormAlertDialog>
                      {user.employee.status === EmployeeStatusEnum.Active && (
                        <SubmitButton
                          form="employee-form"
                          color="green"
                          text={t('save')}
                          submittingText={t('saving')}
                        />
                      )}
                    </Flex>
                  </Flex>
                </>
              )}
            </Flex>
          </div>
        </Flex>
      </Container>
    </main>
  );
}
