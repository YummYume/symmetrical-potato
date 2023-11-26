import { Container, Heading, Section, Text } from '@radix-ui/themes';
import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { Link } from '~/lib/components/Link';
import { FieldInput } from '~components/form/FieldInput';
import { SubmitButton } from '~components/form/SubmitButton';

export let handle = {
  i18n: ['common', 'login'],
};

export default function Login() {
  const { t } = useTranslation();

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('register', { ns: 'login' })}
      </Heading>
      <Container p="4" size="1">
        <Form method="post" className="space-y-4" unstable_viewTransition>
          <FieldInput name="username" label={t('username')} type="text" error="" required />
          <FieldInput name="password" label={t('password')} type="password" error="" required />
          <SubmitButton className="w-full" text={t('login')} submittingText={t('logging_in')} />
          <Text as="p">
            {t('already-registered', { ns: 'login' })} <Link to="/login">{t('login')}</Link>
          </Text>
        </Form>
      </Container>
    </Section>
  );
}
