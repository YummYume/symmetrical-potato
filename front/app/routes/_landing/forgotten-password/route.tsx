import { Container, Heading, Section } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { forgottenPasswordResolver } from '~/lib/validators/forgottenPassword';

import type { ForgottenPasswordFormData } from '~/lib/validators/forgottenPassword';

export default function ForgottenPassword() {
  const { t } = useTranslation();
  const methods = useRemixForm<ForgottenPasswordFormData>({
    mode: 'onSubmit',
    resolver: forgottenPasswordResolver,
  });

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('forgotten-password', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <RemixFormProvider {...methods}>
          <form method="post" className="mb-4 space-y-4" onSubmit={methods.handleSubmit}>
            <FieldInput name="username" label={t('username')} required />
            <SubmitButton
              className="w-full"
              text={t('reset', { ns: 'login' })}
              submittingText={t('logging_in')}
            />
          </form>
        </RemixFormProvider>
        <Link to="/login">{t('login')}</Link>
      </Container>
    </Section>
  );
}
