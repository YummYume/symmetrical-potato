<?php

namespace App\Enum;

use App\Enum\Traits\UtilsTrait;

enum HeistPhaseEnum: string
{
    use UtilsTrait;

    case Planning = 'planning';
    case InProgress = 'in_progress';
    case Succeeded = 'succeeded';
    case Failed = 'failed';
    case Cancelled = 'cancelled';

    public static function isFinished(self $phase): bool
    {
        return \in_array($phase, [self::Succeeded, self::Failed, self::Cancelled], true);
    }
}
