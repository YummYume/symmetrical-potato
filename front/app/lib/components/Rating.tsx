import { Rating as BaseRating } from '@smastrom/react-rating';
import { useTranslation } from 'react-i18next';

import type { ComponentProps } from 'react';

export type RatingProps = ComponentProps<typeof BaseRating>;

export const Rating = ({ items = 5, readOnly, value, ...rest }: RatingProps) => {
  const { t } = useTranslation();
  const translatedItems = Array.from<string, string>({ length: items }, (_, i) =>
    t('rating.star', { rating: i + 1 }),
  );
  const ariaLabel = readOnly
    ? t('rating.label.read_only', {
        rating: value,
        total: items,
      })
    : t('rating.label');

  return (
    <BaseRating
      invisibleItemLabels={translatedItems}
      invisibleLabel={ariaLabel}
      {...rest}
      items={items}
      readOnly={readOnly}
      value={value}
    />
  );
};
