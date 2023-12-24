import { Container, Heading, Section, Text } from '@radix-ui/themes';
import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { Link } from '~/lib/components/Link';
import { registerResolver, type RegisterFormData } from '~/lib/validators/register';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';

export default function Register() {
  const { t } = useTranslation();
  const methods = useRemixForm<RegisterFormData>({ mode: 'onSubmit', resolver: registerResolver });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('register', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <Form method="post" className="space-y-4" unstable_viewTransition>
            <FieldInput name="username" label={t('username')} required />
            <FieldInput name="password" label={t('password')} type="password" required />
            <FieldInput
              name="passwordConfirm"
              label={t('password_confirm')}
              type="password"
              required
            />
            <SubmitButton className="w-full" text={t('login')} submittingText={t('logging_in')} />
            <Text as="p">
              {t('already-registered', { ns: 'login' })} <Link to="/login">{t('login')}</Link>
            </Text>
          </Form>
        </RemixFormProvider>
      </Container>
    </Section>
  );
}
