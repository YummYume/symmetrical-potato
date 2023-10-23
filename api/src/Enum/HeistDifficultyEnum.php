<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum HeistDifficultyEnum: string
{
    use UtilsTrait;

    case Normal = 'normal';
    case Hard = 'hard';
    case VeryHard = 'very_hard';
    case Overkill = 'overkill';
}
