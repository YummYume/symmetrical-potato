import { Heading } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  return {};
}

export type Loader = typeof loader;

export default function Locations() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Heading align="center" as="h1" size="9">
        {t('locations')}
      </Heading>
    </main>
  );
}
