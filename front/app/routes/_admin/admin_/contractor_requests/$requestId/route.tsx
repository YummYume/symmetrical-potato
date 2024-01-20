import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Blockquote, Button, Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getContractorRequest, updateContractorRequest } from '~/lib/api/contractor-request';
import { ContractorRequestStatusEnum } from '~/lib/api/types';
import { HistoryInfoPopover } from '~/lib/components/HistoryInfoPopover';
import { Link } from '~/lib/components/Link';
import { ContractorRequestStatusBadge } from '~/lib/components/contractor_request/ContractorRequestStatusBadge';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getUriId } from '~/lib/utils/path';
import { adminContractorRequestResolver } from '~/lib/validators/admin/contractor-request';
import { FLASH_MESSAGE_KEY } from '~/root';
import { FormAlertDialog } from '~components/dialog/FormAlertDialog';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { AdminContractorRequestFormData } from '~/lib/validators/admin/contractor-request';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.requestId) {
    throw redirect('/admin/contractor_requests');
  }

  try {
    const response = await getContractorRequest(context.client, params.requestId);

    return {
      contractorRequest: response.contractorRequest,
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'contractor_request')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'contractor_request.not_found',
    });
  }
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.requestId) {
    throw redirect('/admin/contractor_requests');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } =
    await getValidatedFormData<AdminContractorRequestFormData>(
      request,
      adminContractorRequestResolver,
    );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateContractorRequest(context.client, {
      id: `/contractor_requests/${params.requestId}`,
      ...data,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('contractor_request.updated', { ns: 'flash' }),
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

export default function User() {
  const { contractorRequest } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const methods = useRemixForm<AdminContractorRequestFormData>({
    mode: 'onSubmit',
    resolver: adminContractorRequestResolver,
    disabled: contractorRequest.status !== ContractorRequestStatusEnum.Pending,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      adminComment: contractorRequest.adminComment || '',
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">
            {t('contractor_request.request_of', {
              ns: 'admin',
              name: contractorRequest.user.username,
            })}
          </Heading>
          <ContractorRequestStatusBadge status={contractorRequest.status} />
        </Flex>
        <HistoryInfoPopover
          createdAt={contractorRequest.createdAt}
          createdBy={contractorRequest.createdBy?.username}
          updatedAt={contractorRequest.updatedAt}
          updatedBy={contractorRequest.updatedBy?.username}
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
              id="contractor_request-form"
            >
              <Flex direction="column" gap="2">
                <Text>{t('contractor_request.reason')}</Text>
                <Blockquote>{contractorRequest.reason}</Blockquote>
              </Flex>
              <Flex direction="column" gap="2">
                <Text>{t('user')}</Text>
                <UserHoverCard
                  username={contractorRequest.user.username}
                  description={contractorRequest.user.profile.description}
                  mainRole={contractorRequest.user.mainRole}
                >
                  <Link
                    to={`/admin/users/${getUriId(contractorRequest.user.id)}`}
                    className="w-fit"
                  >
                    {contractorRequest.user.username}
                  </Link>
                </UserHoverCard>
              </Flex>
              <TextAreaInput
                name="adminComment"
                label={t('contractor_request.admin_comment')}
                rows={5}
              />
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        <Flex align="center" gap="4">
          <Form
            id="contractor_request-delete-form"
            action="delete"
            method="post"
            className="hidden"
            unstable_viewTransition
          />
          <FormAlertDialog
            title={t('delete')}
            description={t('contractor_request.delete.confirm', {
              ns: 'admin',
            })}
            formId="contractor_request-delete-form"
          >
            <Button type="button" color="red">
              {t('delete')}
            </Button>
          </FormAlertDialog>
        </Flex>
        {contractorRequest.status === ContractorRequestStatusEnum.Pending ? (
          <Flex align="center" gap="4">
            <FormAlertDialog
              title={t('contractor_request.reject', {
                ns: 'admin',
              })}
              description={t('contractor_request.reject.confirm', {
                ns: 'admin',
              })}
              formId="contractor_request-form"
              actionColor="tomato"
              submitButtonProps={{
                name: 'status',
                value: ContractorRequestStatusEnum.Rejected,
                onClick: () => {
                  methods.setValue('status', ContractorRequestStatusEnum.Rejected);
                },
              }}
            >
              <Button type="button" color="tomato">
                {t('contractor_request.reject', { ns: 'admin' })}
              </Button>
            </FormAlertDialog>
            <FormAlertDialog
              title={t('contractor_request.accept', {
                ns: 'admin',
              })}
              description={t('contractor_request.accept.confirm', {
                ns: 'admin',
              })}
              formId="contractor_request-form"
              actionColor="green"
              submitButtonProps={{
                name: 'status',
                value: ContractorRequestStatusEnum.Accepted,
                onClick: () => {
                  methods.setValue('status', ContractorRequestStatusEnum.Accepted);
                },
              }}
            >
              <Button type="button" color="green">
                {t('contractor_request.accept', { ns: 'admin' })}
              </Button>
            </FormAlertDialog>
          </Flex>
        ) : (
          <div />
        )}
      </Flex>
    </Flex>
  );
}
