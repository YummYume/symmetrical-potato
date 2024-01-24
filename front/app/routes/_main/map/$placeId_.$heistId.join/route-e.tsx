import { Dialog, Heading } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { ROLES, denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.HEISTER);

  return {};
}

export type Loader = typeof loader;

export async function action({ context, params, request }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.HEISTER);
  return {};
}

export default function Join() {
  const { t } = useTranslation();

  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          {t('join')}
        </Heading>
      </Dialog.Title>
    </div>
  );
}
