import { redirect, type ActionArgs, type LoaderArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { bearerCookie } from '~/lib/cookies.server';
import { commitSession, getSession } from '~/lib/session.server';
import { FLASH_MESSAGE_KEY } from '~/root';
import { requestAuthToken } from '~api/user';
import { FieldInput } from '~components/form/FieldInput';
import { SubmitButton } from '~components/form/SubmitButton';
import { getMessageForErrorStatusCode, hasErrorStatusCode } from '~utils/api';

import type { CookieSerializeOptions } from '@remix-run/node';
import type { FlashMessage } from '~/root';

export const loginValidator = zfd.formData({
  username: zfd.text(z.string().min(1, { message: 'Please enter your username.' })),
  password: zfd.text(z.string().min(1, { message: 'Please enter your password.' })),
});

export async function loader({ context }: LoaderArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  return null;
}

export async function action({ request, context }: ActionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }
  const result = loginValidator.safeParse(await request.formData());

  if (!result.success) {
    // TODO: Return the error messages to the form

    return new Response(null, {
      status: 400,
    });
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

      throw redirect('/dashboard', {
        headers: {
          'Set-Cookie': await bearerCookie.serialize(user.token, cookieOptions),
        },
      });
    }

    errorMessage = 'Invalid credentials.';
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

  return new Response(null, {
    status: 401,
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function Login() {
  return (
    <Form method="post" className="flex flex-col gap-2">
      <FieldInput name="username" label="Username" type="text" required />
      <FieldInput name="password" label="Password" type="password" required />
      <SubmitButton text="Login" submittingText="Logging in..." />
    </Form>
  );
}
