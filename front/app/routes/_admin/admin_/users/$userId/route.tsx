import { Blockquote, Button, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { adminUserResolver } from '~/lib/validators/admin/user';
import { FLASH_MESSAGE_KEY } from '~/root';
import { UserStatusEnum } from '~api/types';
import { getUser, updateUser, updateUserProfile } from '~api/user';
import { FormAlertDialog } from '~components/dialog/FormAlertDialog';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';
import { UserStatusBadge } from '~components/user/UserStatusBadge';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { AdminUserFormData } from '~/lib/validators/admin/user';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const currentUser = denyAdminAccessUnlessGranted(context.user);

  if (!params.userId) {
    throw redirect('/admin/users');
  }

  try {
    const response = await getUser(context.client, `/users/${params.userId}`);

    return {
      user: response.user,
      currentUser,
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'user')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'user.not_found',
    });
  }
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.userId) {
    throw redirect('/admin/users');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<AdminUserFormData>(
    request,
    adminUserResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    const { description, ...userData } = data;

    const updatedUser = await updateUser(context.client, {
      id: `/users/${params.userId}`,
      ...userData,
    });

    await updateUserProfile(context.client, {
      id: updatedUser.updateUser.user.profile.id,
      description,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('user.updated', { ns: 'flash' }),
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
  const { user, currentUser } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const methods = useRemixForm<AdminUserFormData>({
    disabled: user.status !== UserStatusEnum.Verified,
    mode: 'onSubmit',
    resolver: adminUserResolver,
    defaultValues: {
      email: user.email,
      balance: user.balance,
      description: user.profile.description ?? '',
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Heading as="h2">{user.username}</Heading>
        <UserStatusBadge status={user.status} />
      </Flex>
      <div className="h-[23.875rem]">
        <ScrollArea type="auto" scrollbars="both">
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="space-y-4"
              onSubmit={methods.handleSubmit}
              id="user-form"
            >
              <FieldInput
                type="email"
                name="email"
                label={t('email')}
                defaultValue={user.email}
                required
              />
              <FieldInput
                type="number"
                name="balance"
                label={t('user.balance')}
                defaultValue={user.balance}
                required
              />
              <Flex direction="column" gap="2">
                <Text>{t('user.reason')}</Text>
                <Blockquote>{user.reason}</Blockquote>
              </Flex>
              <Flex direction="column" gap="2">
                <Text>{t('user.roles', { ns: 'admin' })}</Text>
                <ul className="list-inside list-disc pl-1">
                  {user.roles.map((role: string) => (
                    <li key={role}>{t(`user.roles.${role.toLowerCase()}`, { ns: 'admin' })}</li>
                  ))}
                </ul>
              </Flex>
              <section className="space-y-4">
                <Heading as="h3">{t('user.profile')}</Heading>
                <TextAreaInput
                  name="description"
                  label={t('user.description')}
                  defaultValue={user.profile.description}
                  disabled={user.status !== UserStatusEnum.Verified}
                  rows={5}
                />
              </section>
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        {currentUser.id !== user.id ? (
          <Flex align="center" gap="4">
            <Form
              id="user-delete-form"
              action="delete"
              method="post"
              className="hidden"
              unstable_viewTransition
            />
            <FormAlertDialog
              title={t('delete')}
              description={t('user.delete.confirm', {
                ns: 'admin',
              })}
              formId="user-delete-form"
            >
              <Button type="button" color="red">
                {t('delete')}
              </Button>
            </FormAlertDialog>
            {user.status === UserStatusEnum.Unverified && (
              <>
                <Form
                  id="user-validate-form"
                  action="validate"
                  method="post"
                  className="hidden"
                  unstable_viewTransition
                />
                <FormAlertDialog
                  title={t('verify')}
                  description={t('user.verify.confirm', {
                    ns: 'admin',
                  })}
                  formId="user-validate-form"
                  actionColor="green"
                >
                  <Button type="button" color="green">
                    {t('verify')}
                  </Button>
                </FormAlertDialog>
              </>
            )}
            {user.status === UserStatusEnum.Dead && (
              <>
                <Form
                  id="user-revive-form"
                  action="revive"
                  method="post"
                  className="hidden"
                  unstable_viewTransition
                />
                <FormAlertDialog
                  title={t('revive')}
                  description={t('user.revive.confirm', {
                    ns: 'admin',
                  })}
                  formId="user-revive-form"
                  actionColor="green"
                >
                  <Button type="button" color="green">
                    {t('revive')}
                  </Button>
                </FormAlertDialog>
              </>
            )}
            {user.status === UserStatusEnum.Verified && (
              <>
                <Form
                  id="user-kill-form"
                  action="kill"
                  method="post"
                  className="hidden"
                  unstable_viewTransition
                />
                <FormAlertDialog
                  title={t('kill')}
                  description={t('user.kill.confirm', {
                    ns: 'admin',
                  })}
                  formId="user-kill-form"
                  actionColor="tomato"
                >
                  <Button type="button" color="tomato">
                    {t('kill')}
                  </Button>
                </FormAlertDialog>
              </>
            )}
          </Flex>
        ) : (
          <div />
        )}
        <SubmitButton
          form="user-form"
          color="green"
          text={t('save')}
          submittingText={t('saving')}
          disabled={user.status !== UserStatusEnum.Verified}
        />
      </Flex>
    </Flex>
  );
}
