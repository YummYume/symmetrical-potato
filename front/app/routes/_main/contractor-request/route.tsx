import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  PlusIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import {
  Blockquote,
  Box,
  Button,
  Callout,
  Container,
  Flex,
  Heading,
  Popover,
  Text,
} from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { createContractorRequest } from '~/lib/api/contractor-request';
import { ContractorRequestStatusEnum } from '~/lib/api/types';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { contractorRequestResolver } from '~/lib/validators/contractor-request';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ContractorRequestFormData } from '~/lib/validators/contractor-request';
import type { FlashMessage } from '~/root';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);
  const t = await i18next.getFixedT(request, 'common');

  return json({
    user,
    meta: {
      title: t('meta.my_contractor_request.title'),
      description: t('meta.my_contractor_request.description'),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<ContractorRequestFormData>(
    request,
    contractorRequestResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await createContractorRequest(context.client, data);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('contractor_request.created', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/contractor-request', {
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

export default function ContractorRequest() {
  const { t } = useTranslation();
  const { user } = useLoaderData<Loader>();
  const methods = useRemixForm<ContractorRequestFormData>({
    mode: 'onSubmit',
    resolver: contractorRequestResolver,
    disabled: !!user.contractorRequest,
    submitConfig: {
      unstable_viewTransition: true,
    },
  });

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_contractor_request')}
          </Heading>
          <div className="text-center">
            <Flex justify="center" align="center" direction="column" gap="3">
              {!user.contractorRequest && (
                <>
                  <InfoCircledIcon aria-hidden="true" width="46" height="46" />
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t('my_contractor_request.no_request')}
                    </Heading>
                    <Text as="p" mt="2">
                      {t('my_contractor_request.no_request_description')}
                    </Text>
                  </div>
                  <Callout.Root color="orange">
                    <Callout.Icon>
                      <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>{t('my_contractor_request.warning_message')}</Callout.Text>
                  </Callout.Root>
                  <div className="mt-6">
                    <Popover.Root>
                      <Popover.Trigger>
                        <Button type="button" color="green" variant="surface">
                          <PlusIcon width="18" height="18" />
                          {t('my_contractor_request.create')}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content
                        align="center"
                        side="bottom"
                        style={{ minWidth: '20rem', maxWidth: '100vw', width: '40rem' }}
                      >
                        <RemixFormProvider {...methods}>
                          <form method="post" onSubmit={methods.handleSubmit}>
                            <Box grow="1">
                              <TextAreaInput
                                name="reason"
                                className="resize-y"
                                label={t('contractor_request.reason')}
                                placeholder={t('contractor_request.reason.placeholder')}
                                help={t('contractor_request.reason_help')}
                                rows={6}
                              />
                              <Flex gap="2" mt="3" align="end" justify="end">
                                <Popover.Close>
                                  <Button size="1">{t('close')}</Button>
                                </Popover.Close>
                                <SubmitButton
                                  color="green"
                                  text={t('send')}
                                  submittingText={t('sending')}
                                  size="1"
                                />
                              </Flex>
                            </Box>
                          </form>
                        </RemixFormProvider>
                      </Popover.Content>
                    </Popover.Root>
                  </div>
                </>
              )}
              {user.contractorRequest && (
                <>
                  {user.contractorRequest.status === ContractorRequestStatusEnum.Pending && (
                    <QuestionMarkCircledIcon aria-hidden="true" width="46" height="46" />
                  )}
                  {user.contractorRequest.status === ContractorRequestStatusEnum.Accepted && (
                    <CheckCircledIcon
                      aria-hidden="true"
                      className="text-green-10"
                      width="46"
                      height="46"
                    />
                  )}
                  {user.contractorRequest.status === ContractorRequestStatusEnum.Rejected && (
                    <CrossCircledIcon
                      aria-hidden="true"
                      className="text-red-10"
                      width="46"
                      height="46"
                    />
                  )}
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t(
                        `my_contractor_request.status.${user.contractorRequest.status.toLowerCase()}`,
                      )}
                    </Heading>
                    <Text as="p" mt="2">
                      {t(
                        `my_contractor_request.status_description.${user.contractorRequest.status.toLowerCase()}`,
                      )}
                    </Text>
                  </div>
                  {user.contractorRequest.status === ContractorRequestStatusEnum.Pending && (
                    <Callout.Root color="orange">
                      <Callout.Icon>
                        <ExclamationTriangleIcon />
                      </Callout.Icon>
                      <Callout.Text>{t('my_contractor_request.warning_message')}</Callout.Text>
                    </Callout.Root>
                  )}
                  <Flex mt="6" direction="column" gap="3">
                    <Flex className="text-left" direction="column" gap="1">
                      <Text weight="bold" size="3" color="gray">
                        {t('contractor_request.reason')}
                      </Text>
                      <Blockquote>{user.contractorRequest.reason}</Blockquote>
                    </Flex>
                    {user.contractorRequest.adminComment && (
                      <Flex className="text-left" direction="column" gap="1">
                        <Text weight="bold" size="3" color="gray">
                          {t('contractor_request.admin_comment')}
                        </Text>
                        <Blockquote>{user.contractorRequest.adminComment}</Blockquote>
                      </Flex>
                    )}
                    {user.contractorRequest.status !== ContractorRequestStatusEnum.Accepted && (
                      <div className="mt-6 text-center">
                        <Form
                          id="contractor_request-delete-form"
                          action="delete"
                          method="post"
                          className="hidden"
                          unstable_viewTransition
                        />
                        <FormAlertDialog
                          title={t('delete')}
                          description={t('my_contractor_request.delete.confirm')}
                          formId="contractor_request-delete-form"
                        >
                          <Button type="button" color="red" className="w-fit">
                            {t('delete')}
                          </Button>
                        </FormAlertDialog>
                      </div>
                    )}
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
