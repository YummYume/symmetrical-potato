<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum EmployeeStatusEnum: string
{
    use UtilsTrait;

    case Active = 'active';
    case Pending = 'pending';
    case Rejected = 'rejected';
}
