<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum ReviewRatingEnum: int
{
    use UtilsTrait;

    case ZeroPointFive = 5;
    case One = 10;
    case OnePointFive = 15;
    case Two = 20;
    case TwoPointFive = 25;
    case Three = 30;
    case ThreePointFive = 35;
    case Four = 40;
    case FourPointFive = 45;
    case Five = 50;

    public static function getRatingValue(self $rating): int
    {
        return $rating->value / 10;
    }
}
