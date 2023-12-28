import { Heading } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  return {};
}

export type Loader = typeof loader;

export default function Assets() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Heading align="center" as="h1" size="9">
        {t('assets')}
      </Heading>
    </main>
  );
}
