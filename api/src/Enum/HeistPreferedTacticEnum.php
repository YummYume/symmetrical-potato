<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum HeistPreferedTacticEnum: string
{
    use UtilsTrait;

    case Loud = 'loud';
    case Stealth = 'stealth';
    case SemiStealth = 'semi_stealth';
    case Unknown = 'unknown';
}
