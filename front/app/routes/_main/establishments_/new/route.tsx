import { Container, Heading } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { getValidatedFormData } from 'remix-hook-form';

import { createEstablishment } from '~/lib/api/establishment';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { establishmentResolver } from '~/lib/validators/establishment';
import { FLASH_MESSAGE_KEY } from '~/root';

import { FormEstablishment } from '../../establishments/FormEstablishment';

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { EstablishmentFormData } from '~/lib/validators/establishment';
import type { FlashMessage } from '~/root';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  const t = await i18next.getFixedT(request);

  return {
    meta: {
      title: t('meta.establishments_new.title'),
      description: t('meta.establishments_new.description'),
    },
  };
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<EstablishmentFormData>(
    request,
    establishmentResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await createEstablishment(context.client, data);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('establishment.created', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/establishments`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 404])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 404]);
    } else {
      throw error;
    }
  }

  if (errorMessage) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: errorMessage,
      type: 'error',
    } as FlashMessage);
  }

  return json(
    { errors: {}, receivedValues },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

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

export default function New() {
  const { t } = useTranslation();

  return (
    <Container className="space-y-12 px-4 lg:px-0" size="2">
      <main className="space-y-12 py-10">
        <Heading className="text-center" size="9">
          {t('establishment.new')}
        </Heading>
        <FormEstablishment />
      </main>
    </Container>
  );
}
