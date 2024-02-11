import type { ActionFunctionArgs } from '@remix-run/node';

export function action({ params, request }: ActionFunctionArgs) {
  if (!params.placeId) {
    return { status: 404 };
  }

  return null;
}
