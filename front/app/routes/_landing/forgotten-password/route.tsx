import { Container, Heading, Section } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { requestResetPasswordUser } from '~/lib/api/user';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { forgottenPasswordResolver } from '~/lib/validators/forgotten-password';
import { FLASH_MESSAGE_KEY, type FlashMessage } from '~/root';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ForgottenPasswordFormData } from '~/lib/validators/forgotten-password';

export async function loader({ context, request }: LoaderFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, 'login');

  return json({
    meta: {
      title: t('meta.forgotten_password.title', {
        ns: 'login',
      }),
      description: t('meta.forgotten_password.description', {
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

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<ForgottenPasswordFormData>(
    request,
    forgottenPasswordResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  try {
    await requestResetPasswordUser(context.client, data);
  } catch (error) {
    // We don't do anything in case of an error, we don't want the user to know if the account exists or not
  }

  session.flash(FLASH_MESSAGE_KEY, {
    content: t('user.password_reset_sent', { ns: 'flash' }),
    type: 'success',
  } as FlashMessage);

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export type Action = typeof action;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [{ title: data.meta.title }, { name: 'description', content: data.meta.description }];
};

export default function ForgottenPassword() {
  const { t } = useTranslation();
  const methods = useRemixForm<ForgottenPasswordFormData>({
    mode: 'onSubmit',
    resolver: forgottenPasswordResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
  });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('forgotten-password', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="mb-4 space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput name="username" label={t('username')} required autoComplete="username" />
            <FieldInput
              name="email"
              label={t('email')}
              type="email"
              required
              autoComplete="email"
            />
            <SubmitButton
              className="w-full"
              text={t('reset.send', { ns: 'login' })}
              submittingText={t('sending')}
            />
          </form>
        </RemixFormProvider>
      </Container>
    </Section>
  );
}
