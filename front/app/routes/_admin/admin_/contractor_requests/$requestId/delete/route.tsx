import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteContractorRequest } from '~/lib/api/contractor-request';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.requestId) {
    throw redirect('/admin/contractor_requests');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await deleteContractorRequest(context.client, params.requestId);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('contractor_request.deleted', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/admin/contractor_requests', {
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

  return redirect(`/admin/contractor_requests/${params.requestId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
