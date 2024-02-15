import { json } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { getValidatedFormData } from 'remix-hook-form';
import { redirect } from 'remix-typedjson';

import { updateReview } from '~/lib/api/review';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { reviewResolver } from '~/lib/validators/review';
import { FLASH_MESSAGE_KEY } from '~/root';

import { getRatingByValue } from '../../FormReview';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { ReviewFormData } from '~/lib/validators/review';
import type { FlashMessage } from '~/root';

export async function action({ params, request, context }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/map');
  }

  if (!params.reviewId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<ReviewFormData>(request, reviewResolver);

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  try {
    await updateReview(context.client, {
      id: params.reviewId,
      rating: getRatingByValue(data.rating),
      comment: data.comment,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('review.updated_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 403])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 403]);
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

  throw redirect(`/map/${params.placeId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
