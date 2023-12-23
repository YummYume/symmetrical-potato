import { Container, Heading, Section } from '@radix-ui/themes';
import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { Link } from '~/lib/components/Link';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';

export default function ForgottenPassword() {
  const { t } = useTranslation();

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('forgotten-password', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <Form method="post" className="mb-4 space-y-4" unstable_viewTransition>
          <FieldInput name="username" label={t('username')} type="text" error="" required />
          <SubmitButton
            className="w-full"
            text={t('reset', { ns: 'login' })}
            submittingText={t('logging_in')}
          />
        </Form>
        <Link to="/login">{t('login')}</Link>
      </Container>
    </Section>
  );
}
