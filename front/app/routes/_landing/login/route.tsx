import { Container, Heading, Section, Text } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { Link } from '~/lib/components/Link';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { bearerCookie, refreshTokenCookie } from '~/lib/cookies.server';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { FLASH_MESSAGE_KEY } from '~/root';
import { requestAuthToken } from '~api/user';
import { SubmitButton } from '~components/form/SubmitButton';
import { loginResolver } from '~lib/validators/login';
import { getMessageForErrorStatusCode, hasErrorStatusCode } from '~utils/api';

import type {
  ActionFunctionArgs,
  CookieSerializeOptions,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import type { LoginFormData } from '~/lib/validators/login';
import type { FlashMessage } from '~/root';

export async function loader({ context, request }: LoaderFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, 'login');

  return json({
    meta: {
      title: t('meta.title', {
        ns: 'login',
      }),
      description: t('meta.description', {
        ns: 'login',
      }),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, ['login', 'validators']);
  const { errors, data } = await getValidatedFormData<LoginFormData>(request, loginResolver);

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  const { username, password } = data;
  let errorMessage: string | null = null;

  try {
    const response = await requestAuthToken(context.client, { username, password });
    const token = response.requestToken.token;

    if (token) {
      let jwtCookieOptions: CookieSerializeOptions = {};
      let refreshTokenCookieOptions: CookieSerializeOptions = {};

      if (token.tokenTtl) {
        jwtCookieOptions['maxAge'] = token.tokenTtl;
      }

      if (token.refreshTokenTtl) {
        refreshTokenCookieOptions['maxAge'] = token.refreshTokenTtl;
      }

      const headers = new Headers();

      headers.append('Set-Cookie', await bearerCookie.serialize(token.token, jwtCookieOptions));
      headers.append(
        'Set-Cookie',
        await refreshTokenCookie.serialize(token.refreshToken, refreshTokenCookieOptions),
      );

      return redirect('/dashboard', {
        headers,
      });
    }

    errorMessage = t('invalid_credentials', {
      ns: 'login',
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCode(error, 401)) {
      errorMessage = getMessageForErrorStatusCode(error, 401);
    } else {
      throw error;
    }
  }

  const session = await getSession(request.headers.get('Cookie'));

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

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [{ title: data.meta.title }, { name: 'description', content: data.meta.description }];
};

export default function Login() {
  const { t } = useTranslation();
  const methods = useRemixForm<LoginFormData>({ mode: 'onSubmit', resolver: loginResolver });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('login')}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput name="username" label={t('username')} required />
            <FieldInput name="password" label={t('password')} type="password" required />
            <SubmitButton className="w-full" text={t('login')} submittingText={t('logging_in')} />
            <Text as="p">
              {t('forgotten-password', { ns: 'login' })}{' '}
              <Link to="/forgotten-password">{t('click_here', { ns: 'login' })}</Link>
            </Text>
            <Text as="p">
              {t('not_registered', { ns: 'login' })} <Link to="/register">{t('register')}</Link>
            </Text>
          </form>
        </RemixFormProvider>
      </Container>
    </Section>
  );
}
