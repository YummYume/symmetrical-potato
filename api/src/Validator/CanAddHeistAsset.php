<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute]
final class CanAddHeistAsset extends Constraint
{
    public function __construct(
        public string $cannotAddMessage = 'asset.heist.cannot_add',
        public string $mustAddMessage = 'asset.heist.must_add',
        ?array $groups = null,
        mixed $payload = null,
    ) {
        parent::__construct([], $groups, $payload);
    }
}
