<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum ContractorRequestStatusEnum: string
{
    use UtilsTrait;

    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
