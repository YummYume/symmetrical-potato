import { Blockquote, Button, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { UserLocaleEnum } from '~/lib/api/types';
import { updateUser, updateUserProfile } from '~/lib/api/user';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { UserAvatar } from '~/lib/components/user/UserAvatar';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { formatEnums } from '~/lib/utils/tools';
import { userResolver } from '~/lib/validators/user';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { UserFormData } from '~/lib/validators/user';
import type { FlashMessage } from '~/root';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);
  const t = await i18next.getFixedT(request, 'common');

  return json({
    user,
    meta: {
      title: t('meta.my_account.title'),
      description: t('meta.my_account.description'),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<UserFormData>(
    request,
    userResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    const { description, ...userData } = data;

    const updatedUser = await updateUser(context.client, {
      id: `/users/${getUriId(user.id)}`,
      email: userData.email,
      plainPassword: userData.password?.trim() ? userData.password : undefined,
      locale: userData.locale,
    });

    await updateUserProfile(context.client, {
      id: updatedUser.updateUser.user.profile.id,
      description,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('account.updated', { ns: 'flash' }),
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

export default function Account() {
  const { user } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const userLocales = formatEnums(Object.values(UserLocaleEnum), 'user.locale');
  const methods = useRemixForm<UserFormData>({
    mode: 'onSubmit',
    resolver: userResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      email: user.email,
      password: '',
      passwordConfirm: '',
      locale: user.locale,
      description: user.profile.description ?? '',
    },
  });

  return (
    <main className="px-4 py-10 lg:px-0">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_account')}
          </Heading>
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="flex flex-col items-center gap-5"
              onSubmit={methods.handleSubmit}
            >
              <Grid width="100%" columns={{ initial: '1', md: '2' }} gap="3">
                <section className="space-y-4">
                  <Heading as="h2">{t('user.account')}</Heading>
                  <Flex direction="column" gap="2">
                    <Text>{t('username')}</Text>
                    <Blockquote>{user.username}</Blockquote>
                  </Flex>
                  <FieldInput type="email" name="email" label={t('email')} required />
                  <FieldSelect
                    name="locale"
                    label={t('user.locale')}
                    options={userLocales}
                    help={t('user.locale.help')}
                    required
                  />
                  <FieldInput
                    name="password"
                    label={t('password')}
                    type="password"
                    autoComplete="new-password"
                  />
                  <FieldInput
                    name="passwordConfirm"
                    label={t('password_confirm')}
                    type="password"
                    autoComplete="new-password"
                  />
                </section>
                <section className="space-y-4">
                  <Heading as="h2">{t('user.profile')}</Heading>
                  <UserAvatar username={user.username} mainRole={user.mainRole} />
                  <TextAreaInput name="description" label={t('user.description')} rows={12} />
                </section>
              </Grid>

              <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
                <Flex align="center" gap="4">
                  <FormAlertDialog
                    title={t('delete')}
                    description={t('my_account.delete.confirm')}
                    formId="account-delete-form"
                  >
                    <Button className="min-w-32 max-w-full" type="button" color="red">
                      {t('delete')}
                    </Button>
                  </FormAlertDialog>
                </Flex>
                <SubmitButton
                  className="min-w-32 max-w-full"
                  text={t('save')}
                  submittingText={t('saving')}
                />
              </Flex>
            </form>
          </RemixFormProvider>
        </Flex>
      </Container>

      <Form
        id="account-delete-form"
        action="delete"
        method="post"
        className="hidden"
        unstable_viewTransition
      />
    </main>
  );
}
