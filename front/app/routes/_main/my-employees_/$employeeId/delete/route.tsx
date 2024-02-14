import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteEmployee } from '~/lib/api/employee';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  denyAccessUnlessGranted(context.user, [ROLES.CONTRACTOR]);

  if (!params.employeeId) {
    throw redirect('/my-employees');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await deleteEmployee(context.client, params.employeeId);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('employee.deleted', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/my-employees', {
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

  return redirect('/my-employees', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
