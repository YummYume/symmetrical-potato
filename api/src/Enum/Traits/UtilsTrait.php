<?php

namespace App\Enum\Traits;

trait UtilsTrait
{
    /**
     * @return array<int|string, int|string>
     */
    public static function toArray(bool $reversed = false): array
    {
        return array_combine(
            array_map(static fn ($item): string => $reversed ? $item->value : $item->name, self::cases()),
            array_map(static fn ($item): string => $reversed ? $item->name : $item->value, self::cases())
        );
    }

    public static function random(): static
    {
        return self::cases()[array_rand(self::cases())];
    }
}
