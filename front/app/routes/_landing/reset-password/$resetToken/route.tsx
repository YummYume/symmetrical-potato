import { Container, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getResetTokenUser, resetPasswordUser } from '~/lib/api/user';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { resetPasswordResolver } from '~/lib/validators/forgotten-password';
import { FLASH_MESSAGE_KEY, type FlashMessage } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ResetPasswordFormData } from '~/lib/validators/forgotten-password';

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  if (!params.resetToken) {
    throw new Response(null, {
      status: 404,
    });
  }

  try {
    await getResetTokenUser(context.client, params.resetToken);
  } catch (error) {
    console.log('error', error);

    throw new Response(null, {
      status: 404,
    });
  }

  const t = await i18next.getFixedT(request, 'login');

  return json({
    meta: {
      title: t('meta.reset_password.title', {
        ns: 'login',
      }),
      description: t('meta.reset_password.description', {
        ns: 'login',
      }),
    },
  });
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  if (!params.resetToken) {
    throw new Response(null, {
      status: 404,
    });
  }

  try {
    await getResetTokenUser(context.client, params.resetToken);
  } catch (error) {
    throw new Response(null, {
      status: 404,
    });
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<ResetPasswordFormData>(
    request,
    resetPasswordResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await resetPasswordUser(context.client, {
      plainPassword: data.password,
      resetToken: params.resetToken,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('user.password_reset.success', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/login', {
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

export default function ForgottenPassword() {
  const { t } = useTranslation();
  const methods = useRemixForm<ResetPasswordFormData>({
    mode: 'onSubmit',
    resolver: resetPasswordResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
  });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('reset', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="mb-4 space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput
              name="password"
              label={t('new_password')}
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldInput
              name="passwordConfirm"
              label={t('new_password_confirm')}
              type="password"
              required
              autoComplete="new-password"
            />
            <SubmitButton
              className="w-full"
              text={t('reset', { ns: 'login' })}
              submittingText={t('sending')}
            />
          </form>
        </RemixFormProvider>
      </Container>
    </Section>
  );
}
