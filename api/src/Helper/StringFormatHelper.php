<?php

namespace App\Helper;

final class StringFormatHelper
{
    /**
     * @description convert string snake_case to camelCase
     */
    public static function snakeToCamel(string $input): string
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $input))));
    }

    /**
     * @description convert string camelCase to snake_case
     */
    public static function camelToSnake(string $input): string
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }
}
