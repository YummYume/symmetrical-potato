import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { reviewResolver, type ReviewFormData } from '~/lib/validators/review';

import type { ReviewRatingEnum } from '~/lib/api/types';

type FormReviewProps = {
  review?: ReviewFormData;
};

export function FormReview({ review }: FormReviewProps) {
  const { t } = useTranslation();

  const ratings = {
    ZeroPointFive: '0.5',
    One: '1',
    OnePointFive: '1.5',
    Two: '2',
    TwoPointFive: '2.5',
    Three: '3',
    ThreePointFive: '3.5',
    Four: '4',
    FourPointFive: '4.5',
    Five: '5',
  };

  const reviewRatings = Object.entries(ratings).map(([value, label]) => ({
    value,
    label,
  })) as { value: ReviewRatingEnum; label: string }[];

  const methods = useRemixForm<ReviewFormData>({
    mode: 'onSubmit',
    resolver: reviewResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: review || {
      rating: reviewRatings[0].value,
      comment: '',
    },
  });

  return (
    <RemixFormProvider {...methods}>
      <form>
        <FieldSelect label={t('review.rating')} name="rating" options={reviewRatings} />
        <TextAreaInput
          label={t('review.comment')}
          name="comment"
          placeholder={t('review.comment.placeholder')}
          required
          rows={5}
        />
      </form>
    </RemixFormProvider>
  );
}
