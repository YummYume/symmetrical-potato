import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteEmployee } from '~/lib/api/employee';
import { EmployeeStatusEnum } from '~/lib/api/types';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const user = denyAccessUnlessGranted(context.user);
  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const session = await getSession(request.headers.get('Cookie'));

  if (!user.employee) {
    return redirect('/job', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  let errorMessage: string | null = null;

  try {
    await deleteEmployee(context.client, getUriId(user.employee.id));

    session.flash(FLASH_MESSAGE_KEY, {
      content:
        user.employee.status === EmployeeStatusEnum.Active
          ? t('job.deleted', { ns: 'flash' })
          : t('job.deleted_demand', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect('/job', {
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

  return redirect('/job', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
