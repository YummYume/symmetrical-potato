import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteEstablishment } from '~/lib/api/establishment';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw redirect('/admin/establishments');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await deleteEstablishment(context.client, params.establishmentId);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('establishment.deleted', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/admin/establishments', {
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

  return redirect(`/admin/establishments/${params.establishmentId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
