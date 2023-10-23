<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum ReviewRatingEnum: int
{
    use UtilsTrait;

    case ZeroPointFive = 0.5;
    case One = 1;
    case OnePointFive = 1.5;
    case Two = 2;
    case TwoPointFive = 2.5;
    case Three = 3;
    case ThreePointFive = 3.5;
    case Four = 4;
    case FourPointFive = 4.5;
    case Five = 5;
}
