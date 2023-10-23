<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum UserLocaleEnum: string
{
    use UtilsTrait;

    case En = 'en';
    case Fr = 'fr';
}
