<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Helper\StringFormatHelper;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\PropertyInfo\Type;
use Symfony\Component\Uid\Uuid;

final class UuidFilter extends AbstractFilter
{
    private const TARGET_PROPERTY = 'id';

    private const DESCRIPTION_PROPERTY = [
        'type' => Type::BUILTIN_TYPE_STRING,
        'required' => false,
        'description' => 'Recursively filter by UUID',
        'openapi' => [
            'example' => 'If the property is "uuid_employee__user" the filter will be applied to the property "employee.user" of the entity. 
                If the property is "uuid" the filter will be applied to the property "id" of the entity (you don\'t need to specify the id property of the root entity).',
            'description' => 'Recursively filter by UUID',
            'name' => 'UUID filter',
            'type' => 'string',
        ],
    ];

    /**
     * @param array<string, mixed> $context
     * @param string|int           $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        // Check if the query uses the uuid filter
        if (!str_contains($property, 'uuid')) {
            return;
        }

        // Check if the value is a valid UUID and convert it to binary
        try {
            $value = Uuid::fromString($this->getIdFromURI($value))->toBinary();
        } catch (\Exception $e) {
            return;
        }

        // Get the property of the path
        $pathProperty = 'uuid' === $property ? UuidFilter::TARGET_PROPERTY : $this->getPathProperty($property, $this->getProperties());

        // Return if the property does not exist
        if (null === $pathProperty) {
            return;
        }

        // Check if the property is not enabled and mapped or if the property is not the target property
        if ((!$this->isPropertyEnabled($pathProperty, $resourceClass) || !$this->isPropertyMapped($pathProperty, $resourceClass, true)) && !(UuidFilter::TARGET_PROPERTY === $pathProperty)) {
            return;
        }

        // Get the alias of the root entity
        $alias = $queryBuilder->getRootAliases()[0];

        // Split the path property
        $pathProperty = explode('.', $pathProperty);

        // If the first property of the path is the target property, apply the filter else call the nestedQuery function
        if (UuidFilter::TARGET_PROPERTY === $pathProperty[0]) {
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

        // Create the join for the property
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
        // Get the properties of the resource
        $properties = $this->getProperties() ?? [];

        $description = [
            'uuid' => array_merge(
                ['property' => UuidFilter::TARGET_PROPERTY],
                UuidFilter::DESCRIPTION_PROPERTY
            ),
        ];

        foreach ($properties as $property => $strategy) {
            if (UuidFilter::TARGET_PROPERTY === $property || str_contains($property, 'uuid')) {
                continue;
            }

            $description['uuid_'.StringFormatHelper::camelToSnake($property)] = array_merge(
                ['property' => $property],
                UuidFilter::DESCRIPTION_PROPERTY
            );
        }

        return $description;
    }

    /**
     * @param array<string, string> $properties
     *
     * @description Check if the target property is in the array of properties if not return null else return formatted property
     */
    private function getPathProperty(string $targetProperty, array $properties): ?string
    {
        $removeUuid = str_replace('uuid_', '', $targetProperty);
        $replaceDoubleUnderscore = str_replace('__', '.', $removeUuid);
        $snakeToCamel = StringFormatHelper::snakeToCamel($replaceDoubleUnderscore);

        if (array_key_exists($snakeToCamel, $properties)) {
            return $snakeToCamel;
        } else {
            return null;
        }
    }

    private function getIdFromURI(string $uri): string
    {
        $parts = explode('/', $uri);
        $id = end($parts);

        return $id;
    }
}
