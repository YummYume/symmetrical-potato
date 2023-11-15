<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\QueryCollectionResolverInterface;
use Symfony\Bundle\SecurityBundle\Security;

class HeistQueryResolver implements QueryCollectionResolverInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(iterable $collection, array $context): iterable
    {
        return $collection;
    }
}
