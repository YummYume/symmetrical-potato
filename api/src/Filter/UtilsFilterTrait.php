<?php

namespace App\Filter;

trait UtilsFilterTrait
{
    private function getIdFromURI(string $uri): string
    {
        $parts = explode('/', $uri);
        $id = end($parts);

        return $id;
    }
}
