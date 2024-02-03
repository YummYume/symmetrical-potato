import { Container, Flex, Heading } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { useTranslation } from 'react-i18next';

import { i18next } from '~/lib/i18n/index.server';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, 'common');

  return json({
    meta: {
      title: t('meta.my_account.title'),
      description: t('meta.my_account.description'),
    },
  });
}

export type Loader = typeof loader;

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

export default function Account() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_account')}
          </Heading>
        </Flex>
      </Container>
    </main>
  );
}
