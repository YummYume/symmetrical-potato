<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute]
final class CanReview extends Constraint
{
    public function __construct(
        public string $message = 'review.can_not_review',
        array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct([], $groups, $payload);
    }
}
