import { redirect, json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { bearerCookie } from '~/lib/cookies.server';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { FLASH_MESSAGE_KEY } from '~/root';
import { requestAuthToken } from '~api/user';
import { FieldInput } from '~components/form/FieldInput';
import { SubmitButton } from '~components/form/SubmitButton';
import { loginValidationSchema } from '~lib/validators/login';
import { getMessageForErrorStatusCode, hasErrorStatusCode } from '~utils/api';
import { getMessageErrorForPath, parseZodErrorsToFieldErrors } from '~utils/error';

import type {
  ActionFunctionArgs,
  CookieSerializeOptions,
  DataFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import type { FlashMessage } from '~/root';

export async function loader({ context, request }: DataFunctionArgs) {
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
  const result = loginValidationSchema.safeParse(await request.formData());

  if (!result.success) {
    return json({ fieldErrors: parseZodErrorsToFieldErrors(result.error.issues) }, { status: 400 });
  }

  const { username, password } = result.data;
  let errorMessage: string | null = null;

  try {
    const response = await requestAuthToken(context.client, username, password);

    if (response && response.loginUser && response.loginUser.user) {
      const user = response.loginUser.user;
      let cookieOptions: CookieSerializeOptions = {};

      if (user.tokenTtl) {
        cookieOptions['maxAge'] = user.tokenTtl;
      }

      return redirect('/dashboard', {
        headers: {
          'Set-Cookie': await bearerCookie.serialize(user.token, cookieOptions),
        },
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
    { fieldErrors: [] },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

export let handle = {
  i18n: ['common'],
};

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [{ title: data.meta.title }, { name: 'description', content: data.meta.description }];
};

export default function Login() {
  const { t } = useTranslation();
  const actionData = useActionData<Action>();
  const fieldErrors = actionData?.fieldErrors ?? [];
  const usernameError = getMessageErrorForPath(fieldErrors, 'username');
  const passwordError = getMessageErrorForPath(fieldErrors, 'password');

  return (
    <Form method="post" className="flex flex-col gap-2">
      <h1>{t('login')}</h1>
      <FieldInput
        name="username"
        label={t('username')}
        type="text"
        error={usernameError ? t(usernameError, { ns: 'validators' }) : undefined}
        required
      />
      <FieldInput
        name="password"
        label={t('password')}
        type="password"
        error={passwordError ? t(passwordError, { ns: 'validators' }) : undefined}
        required
      />
      <SubmitButton text={t('login')} submittingText={t('logging_in')} />
    </Form>
  );
}
