import { Container, Heading, Section, Text } from '@radix-ui/themes';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { UserLocaleEnum } from '~/lib/api/types';
import { createRegistrationDemand } from '~/lib/api/user';
import { Link } from '~/lib/components/Link';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { convertToLocaleEnum } from '~/lib/utils/locale';
import { formatEnums } from '~/lib/utils/tools';
import { registerResolver } from '~/lib/validators/register';
import { FLASH_MESSAGE_KEY } from '~/root';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import type { RegisterFormData } from '~/lib/validators/register';
import type { FlashMessage } from '~/root';

export async function loader({ context, request }: LoaderFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, 'login');

  return json({
    locale: convertToLocaleEnum(context.locale),
    meta: {
      title: t('meta.title', {
        ns: 'register',
      }),
      description: t('meta.description', {
        ns: 'register',
      }),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, ['register', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<RegisterFormData>(
    request,
    registerResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));
  const { email, username, password, reason, locale } = data;

  let errorMessage: string | null = null;

  try {
    await createRegistrationDemand(context.client, {
      email,
      username,
      plainPassword: password,
      reason,
      locale,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('registration_successful', { ns: 'register' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/login', {
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

export type Action = typeof action;

export default function Register() {
  const { locale } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const userLocales = formatEnums(Object.values(UserLocaleEnum), 'user.locale');
  const methods = useRemixForm<RegisterFormData>({
    mode: 'onSubmit',
    resolver: registerResolver,
    defaultValues: {
      locale,
    },
  });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('register')}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput
              name="username"
              label={t('username')}
              required
              autoComplete="username"
              help={t('username.help')}
            />
            <FieldInput
              name="email"
              type="email"
              label={t('email')}
              required
              autoComplete="email"
            />
            <FieldInput
              name="password"
              label={t('password')}
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldInput
              name="passwordConfirm"
              label={t('password_confirm')}
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldSelect
              name="locale"
              label={t('user.locale')}
              options={userLocales}
              help={t('user.locale.help')}
              required
            />
            <TextAreaInput name="reason" label={t('user.reason')} required rows={5} />
            <SubmitButton
              className="w-full"
              text={t('register')}
              submittingText={t('registering')}
            />
            <Text as="p">
              {t('already_registered', { ns: 'register' })} <Link to="/login">{t('login')}</Link>
            </Text>
          </form>
        </RemixFormProvider>
      </Container>
    </Section>
  );
}
