<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum HeistVisibilityEnum: string
{
    use UtilsTrait;

    case Draft = 'draft';
    case Public = 'public';
}
