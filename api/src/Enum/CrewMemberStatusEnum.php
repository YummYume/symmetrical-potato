<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum CrewMemberStatusEnum: string
{
    use UtilsTrait;

    case Free = 'free';
    case Jailed = 'jailed';
    case Dead = 'dead';
}
