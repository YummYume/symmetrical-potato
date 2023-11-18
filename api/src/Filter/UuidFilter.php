<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\Uid\Uuid;

final class UuidFilter extends AbstractFilter
{
    public const TARGET_PROPERTY = 'id';

    /**
     * @param array<string, mixed> $context
     * @param string|int           $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        // Apply the filter only if the property is a UUID
        if ($property !== 'uuid') {
            return;
        }

        try {
            $value = Uuid::fromString($this->getIdFromURI($value))->toBinary();
        } catch (\Exception $e) {
            return;
        }

        // Get first path property filter in the array of properties
        $pathPropertyFilter = $this->getProperties() ? array_keys($this->getProperties())[0] : UuidFilter::TARGET_PROPERTY;

        // Check if the first property of the path is enabled and mapped
        if (!$this->isPropertyEnabled($pathPropertyFilter, $resourceClass) || !$this->isPropertyMapped($pathPropertyFilter, $resourceClass, true)) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $pathProperty = explode('.', $pathPropertyFilter);

        // If there is only one property in the path, apply the filter for the root entity
        if (UuidFilter::TARGET_PROPERTY === $pathPropertyFilter) {
            $queryBuilder
                ->andWhere(sprintf('%s.%s = :%s', $alias, UuidFilter::TARGET_PROPERTY, $property))
                ->setParameter($property, $value);
        } else {
            $this->nestedQuery($queryBuilder, $queryNameGenerator, $pathProperty, $alias, $value);
        }
    }

    /**
     * @param array<int, string> $pathProperties
     *
     * @description Recursive function to join the properties of the path
     */
    public function nestedQuery(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, array $pathProperties, string $alias, string $value): void
    {
        // extract first element of the path
        $property = array_shift($pathProperties);

        // Generate unique parameter name and alias join to avoid collisions with other filters
        $parameterName = $queryNameGenerator->generateParameterName($property);
        $aliasJoin = $queryNameGenerator->generateJoinAlias($property);

        // Join the property to the query builder
        $queryBuilder->join("$alias.$property", $aliasJoin);

        // If there are more properties in the path, call the function again
        if (sizeof($pathProperties) > 0) {
            $queryBuilder->andWhere(sprintf('%s.%s = %s.%s', $aliasJoin, UuidFilter::TARGET_PROPERTY, $alias, $property));

            $this->nestedQuery($queryBuilder, $queryNameGenerator, $pathProperties, $aliasJoin, $value);
        } else {
            $queryBuilder
                ->andWhere(sprintf('%s.%s = :%s', $aliasJoin, UuidFilter::TARGET_PROPERTY, $parameterName))
                ->setParameter($parameterName, $value);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function getDescription(string $resourceClass): array
    {
        // Return the description of your filter
        return [
            'uuid' => [
                'property' => 'uuid',
                'type' => 'string',
                'required' => false,
                'swagger' => [
                    'description' => 'Filter by UUID',
                    'name' => 'UUID filter',
                    'type' => 'string',
                ],
            ],
        ];
    }

    private function getIdFromURI(string $uri): string
    {
        $parts = explode('/', $uri);
        $id = end($parts);

        return $id;
    }
}
