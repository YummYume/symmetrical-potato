import { Button } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { ReviewRatingEnum } from '~/lib/api/types';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { FieldRating } from '~/lib/components/form/custom/FieldRating';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { getUriId } from '~/lib/utils/path';
import { reviewResolver, type ReviewFormData } from '~/lib/validators/review';

import type { ReviewEdge } from '~/lib/api/types';

type FormReviewProps = {
  review?: ReviewEdge;
  establishmentId: string;
};

type Ratings = Record<ReviewRatingEnum, number>;

export const ratings: Ratings = {
  ZeroPointFive: 0.5,
  One: 1,
  OnePointFive: 1.5,
  Two: 2,
  TwoPointFive: 2.5,
  Three: 3,
  ThreePointFive: 3.5,
  Four: 4,
  FourPointFive: 4.5,
  Five: 5,
};

export const getRatingByValue = (value: number): ReviewRatingEnum => {
  const rating = Object.entries(ratings).find(([, v]) => v === value);
  return rating ? (rating[0] as ReviewRatingEnum) : ReviewRatingEnum.One;
};

export function FormReview({ review, establishmentId }: FormReviewProps) {
  const { t } = useTranslation();

  const title = review ? t('edit') : t('add');
  const description = review ? t('review.edit.confirm') : t('review.create.confirm');
  const buttonText = review ? t('update') : t('create');

  const action = `/establishements/${getUriId(establishmentId)}/review/${review ? `${getUriId(review.node.id)}/edit` : 'new'}`;

  const methods = useRemixForm<ReviewFormData>({
    mode: 'onSubmit',
    resolver: reviewResolver,
    submitConfig: {
      action,
      unstable_viewTransition: true,
    },
    defaultValues: {
      rating: (review?.node.rating && ratings[review?.node.rating]) ?? 1,
      comment: review?.node.comment ?? '',
    },
  });

  return (
    <RemixFormProvider {...methods}>
      <form id="review-form" onSubmit={methods.handleSubmit} className="min-w-64 space-y-2">
        <FieldRating style={{ maxWidth: 100 }} label={t('review.rating')} name="rating" />
        <TextAreaInput
          label={t('review.comment')}
          name="comment"
          placeholder={t('review.comment.placeholder')}
          rows={5}
        />
        <FormAlertDialog
          title={title}
          description={description}
          actionColor="green"
          cancelText={t('cancel')}
          formId="review-form"
        >
          <Button type="button" color="green">
            {buttonText}
          </Button>
        </FormAlertDialog>
      </form>
    </RemixFormProvider>
  );
}
