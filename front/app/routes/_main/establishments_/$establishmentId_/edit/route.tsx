import { TrashIcon } from '@radix-ui/react-icons';
import { Container, Flex, Heading, IconButton } from '@radix-ui/themes';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { getValidatedFormData } from 'remix-hook-form';
import { useTypedLoaderData } from 'remix-typedjson';

import { getEstablishment, updateEstablishment } from '~/lib/api/establishment';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { establishmentResolver } from '~/lib/validators/establishment';
import { FLASH_MESSAGE_KEY } from '~/root';

import { FormEstablishment } from '../../../establishments/FormEstablishment';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import type { EstablishmentFormData } from '~/lib/validators/establishment';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.establishmentId) {
    throw redirect('/establishments');
  }

  const t = await i18next.getFixedT(request);

  try {
    const { establishment } = await getEstablishment(context.client, params.establishmentId);

    if (establishment.contractor.id === user.id) {
      return {
        establishment,
        meta: {
          title: t('meta.establishments_edit.title'),
          description: t('meta.establishments_edit.description', {
            name: establishment.name,
          }),
        },
      };
    }
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'establishment')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: t('not_found', { ns: 'response' }),
    });
  }

  throw redirect(`/establishments`);
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.establishmentId) {
    throw redirect('/establishments');
  }

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
    await updateEstablishment(context.client, {
      id: `/establishments/${params.establishmentId}`,
      ...data,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('establishment.updated', { ns: 'flash' }),
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

export default function Edit() {
  const { t } = useTranslation();
  const { establishment } = useTypedLoaderData<Loader>();

  return (
    <Container className="space-y-12 px-4 lg:px-0" size="2">
      <main className="space-y-12 py-10">
        <Flex gap="4" justify="center">
          <Heading size="9">{t('establishment.edit')}</Heading>
          <FormConfirmDialog
            formId="establishment-delete-form"
            title={t('delete')}
            description={t('establishment.delete.confirm')}
            actionColor="red"
            action={`/establishments/${getUriId(establishment.id)}/delete`}
          >
            <IconButton size="4" color="red">
              <TrashIcon color="white" className="size-10" />
            </IconButton>
          </FormConfirmDialog>
        </Flex>
        <FormEstablishment establishment={establishment} />
      </main>
    </Container>
  );
}
