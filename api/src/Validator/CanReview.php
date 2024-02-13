<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute]
final class CanReview extends Constraint
{
    public function __construct(
        public string $message = 'review.cannot_review',
        ?array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct([], $groups, $payload);
    }
}
