import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteEstablishment } from '~/lib/api/establishment';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.establishmentId) {
    throw redirect('/establishments');
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

    return redirect('/establishments', {
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

  return redirect(`/establishments/${params.establishmentId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
