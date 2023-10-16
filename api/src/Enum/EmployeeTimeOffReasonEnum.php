<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum EmployeeTimeOffReasonEnum: string
{
    use UtilsTrait;

    case Vacation = 'vacation';
    case MedicalLeave = 'medical_leave';
    case PersonalLeave = 'personal_leave';
    case Other = 'other';
}
