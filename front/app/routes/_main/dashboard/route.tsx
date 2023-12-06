import { Heading, Section } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { denyAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user);
}

export type Loader = typeof loader;

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Section>
      <Heading align="center" as="h1" size="9">
        {t('dashboard')}
      </Heading>
    </Section>
  );
}
