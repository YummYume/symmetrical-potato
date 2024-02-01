<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum HeistCancellationReasonEnum: string
{
    use UtilsTrait;

    case NoCrewMember = 'no_crew_member';
    case NoEmployee = 'no_employee';
    case Manual = 'manual';
}
