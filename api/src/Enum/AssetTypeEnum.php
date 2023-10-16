<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum AssetTypeEnum: string
{
    use UtilsTrait;

    case Asset = 'asset';
    case Weapon = 'weapon';
    case Equipment = 'equipment';
}
