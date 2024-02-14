import { ArrowLeftIcon } from '@radix-ui/react-icons';
import {
  Blockquote,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Popover,
  Text,
} from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getEmployeesForContractor, validateEmployee } from '~/lib/api/employee';
import { EmployeeStatusEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { EmployeeScheduleList } from '~/lib/components/employee/EmployeeScheduleList';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';
import { validateEmployeeResolver } from '~/lib/validators/employee';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ValidateEmployeeFormData } from '~/lib/validators/employee';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.CONTRACTOR]);

  if (!params.employeeId) {
    throw new Response(null, {
      status: 404,
      statusText: 'employee.not_found',
    });
  }

  try {
    const t = await i18next.getFixedT(request, 'common');
    const { employees } = await getEmployeesForContractor(context.client, getUriId(user.id));
    const employee = employees.edges.find(({ node }) => getUriId(node.id) === params.employeeId);

    if (!employee) {
      throw new Response(null, {
        status: 404,
        statusText: 'employee.not_found',
      });
    }

    return json({
      employee: employee.node,
      meta: {
        title: t('meta.employee_edit.title'),
        description: t('meta.employee_edit.description', {
          name: employee.node.user.username,
        }),
      },
    });
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'employees')) {
      throw e;
    }
  }

  throw new Response(null, {
    status: 404,
    statusText: 'employee.not_found',
  });
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!params.employeeId) {
    throw new Response(null, {
      status: 404,
      statusText: 'employee.not_found',
    });
  } else if (!hasRoles(user, [ROLES.CONTRACTOR])) {
    throw redirect('/my-employees');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<ValidateEmployeeFormData>(
    request,
    validateEmployeeResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await validateEmployee(context.client, {
      codeName: data.status === EmployeeStatusEnum.Active ? data.codeName : undefined,
      status: data.status,
      id: `/employees/${params.employeeId}`,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('employee.updated', { ns: 'flash' }),
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

export default function Edit() {
  const { t } = useTranslation();
  const { employee } = useLoaderData<Loader>();
  const methods = useRemixForm<ValidateEmployeeFormData>({
    mode: 'onSubmit',
    resolver: validateEmployeeResolver,
    disabled: employee.status !== EmployeeStatusEnum.Pending,
    submitConfig: {
      unstable_viewTransition: true,
    },
  });

  return (
    <main className="px-4 py-10 lg:px-0">
      <Container size="3">
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('employee.edit')}
          </Heading>

          <RemixFormProvider {...methods}>
            <Link className="flex items-center gap-1 pb-1 pl-2" to="/my-employees">
              <span aria-hidden="true">
                <ArrowLeftIcon width="20" height="20" />
              </span>
              {t('back')}
            </Link>
            <form
              onSubmit={methods.handleSubmit}
              className="grid justify-items-center gap-8"
              id="employee-form"
            >
              <Grid columns={{ initial: '1', md: '2' }} gap={{ initial: '2', md: '9' }}>
                <Flex direction="column" gap="2">
                  <Flex className="text-left" direction="column" gap="1">
                    <Text weight="bold" size="3" color="gray">
                      {t('establishment')}
                    </Text>
                    <Link to={`/establishments/${getUriId(employee.establishment.id)}`}>
                      {employee.establishment.name}
                    </Link>
                  </Flex>
                  <Flex className="text-left" direction="column" gap="1">
                    <Text weight="bold" size="3" color="gray">
                      {t('user')}
                    </Text>
                    <UserHoverCard
                      username={employee.user.username}
                      description={employee.user.profile?.description}
                      globalRating={employee.user.globalRating}
                      mainRole={employee.user.mainRole}
                    >
                      <Link to={`/profile/${getUriId(employee.user.id)}`}>
                        {employee.user.username}
                      </Link>
                    </UserHoverCard>
                  </Flex>
                  <Flex className="text-left" direction="column" gap="1">
                    <Text weight="bold" size="3" color="gray">
                      {t('employee.status')}
                    </Text>
                    <Blockquote>{t(`employee.status.${employee.status.toLowerCase()}`)}</Blockquote>
                  </Flex>
                  {employee.codeName && (
                    <Flex className="text-left" direction="column" gap="1">
                      <Text weight="bold" size="3" color="gray">
                        {t('employee.code_name')}
                      </Text>
                      <Blockquote>{employee.codeName}</Blockquote>
                    </Flex>
                  )}
                  <Flex className="text-left" direction="column" gap="1">
                    <Text weight="bold" size="3" color="gray">
                      {t('employee.motivation')}
                    </Text>
                    <Blockquote>{employee.motivation}</Blockquote>
                  </Flex>
                  {employee.description && (
                    <Flex className="text-left" direction="column" gap="1">
                      <Text weight="bold" size="3" color="gray">
                        {t('employee.description')}
                      </Text>
                      <Blockquote>{employee.description}</Blockquote>
                    </Flex>
                  )}
                </Flex>
                <Flex className="text-left" direction="column" gap="1">
                  <Text weight="bold" size="3" color="gray">
                    {t('employee.schedule')}
                  </Text>
                  <EmployeeScheduleList schedule={employee.weeklySchedule} />
                </Flex>
              </Grid>
            </form>

            <Flex gap="4" justify="between" role="group" width="100%" align="center">
              <FormConfirmDialog
                formId="employee-delete"
                title={t('delete')}
                description={t('employee.delete.confirm')}
                action="delete"
              >
                <Button type="button" color="tomato">
                  {t('delete')}
                </Button>
              </FormConfirmDialog>

              {employee.status === EmployeeStatusEnum.Pending && (
                <Flex gap="2" align="center">
                  <FormAlertDialog
                    title={t('employee.reject')}
                    description={t('employee.reject.confirm')}
                    formId="employee-form"
                    actionColor="tomato"
                    submitButtonProps={{
                      name: 'status',
                      value: EmployeeStatusEnum.Rejected,
                      onClick: () => {
                        methods.setValue('status', EmployeeStatusEnum.Rejected);
                      },
                    }}
                  >
                    <Button type="button" color="tomato">
                      {t('employee.reject')}
                    </Button>
                  </FormAlertDialog>

                  <Popover.Root>
                    <Popover.Trigger>
                      <Button type="button" color="green">
                        {t('employee.accept')}
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content
                      align="center"
                      side="bottom"
                      style={{ minWidth: '20rem', maxWidth: '100vw', width: '20rem' }}
                    >
                      <FieldInput
                        type="text"
                        name="codeName"
                        label={t('employee.code_name')}
                        help={t('employee.code_name.help')}
                        form="employee-form"
                      />

                      <Flex gap="2" mt="3" align="end" justify="end">
                        <Popover.Close>
                          <Button size="1">{t('close')}</Button>
                        </Popover.Close>
                        <FormAlertDialog
                          title={t('employee.accept')}
                          description={t('employee.accept.confirm')}
                          formId="employee-form"
                          actionColor="green"
                          submitButtonProps={{
                            name: 'status',
                            value: EmployeeStatusEnum.Active,
                            onClick: () => {
                              methods.setValue('status', EmployeeStatusEnum.Active);
                            },
                          }}
                        >
                          <Button size="1" type="button" color="green">
                            {t('employee.accept')}
                          </Button>
                        </FormAlertDialog>
                      </Flex>
                    </Popover.Content>
                  </Popover.Root>
                </Flex>
              )}
            </Flex>
          </RemixFormProvider>
        </Flex>
      </Container>
    </main>
  );
}
