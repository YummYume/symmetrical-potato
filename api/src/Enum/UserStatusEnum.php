<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum UserStatusEnum: string
{
    use UtilsTrait;

    case Unverified = 'unverified';
    case Verified = 'verified';
    case Dead = 'dead';
}
