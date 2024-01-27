<?php

namespace App\Filter\Traits;

trait URIFilterTrait
{
    /**
     * Returns the id from the given URI.
     */
    private function getIdFromURI(string $uri): string
    {
        $parts = explode('/', $uri);
        $id = end($parts);

        return $id;
    }
}
