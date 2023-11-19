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
    private const DESCRIPTION_PROPERTY = [
        'type' => Type::BUILTIN_TYPE_STRING,
        'required' => false,
        'description' => 'Recursively filter by UUID',
        'openapi' => [
            'example' => 'If the property is "employee__user" the filter will be applied to the property "employee.user" of the entity.',
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
        // Check if properties are defined
        if (0 === count($this->getProperties())) {
            return;
        }

        // Get the property of the path
        $pathProperty = $this->getPathProperty($property, $this->getProperties());

        // Return if the property does not exist
        if (null === $pathProperty) {
            return;
        }

        // Check if the value is a valid UUID and convert it to binary
        try {
            $value = Uuid::fromString($this->getIdFromURI($value))->toBinary();
        } catch (\Exception $e) {
            return;
        }

        // Check if the property is not enabled and mapped
        if (!$this->isPropertyEnabled($pathProperty, $resourceClass) || !$this->isPropertyMapped($pathProperty, $resourceClass, true)) {
            return;
        }

        // Get the alias of the root entity
        $alias = $queryBuilder->getRootAliases()[0];

        // Split the path property
        $pathProperty = explode('.', $pathProperty);

        $this->nestedQuery($queryBuilder, $queryNameGenerator, $pathProperty, $alias, $value);
    }

    /**
     * @param array<int, string> $pathProperties
     *
     * @description Recursive function to join the property of the path
     */
    public function nestedQuery(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, array $pathProperties, string $alias, string $value): void
    {
        // extract first element of the path
        $property = array_shift($pathProperties);

        // Generate unique parameter name and alias join to avoid collisions with other filters
        $parameterName = $queryNameGenerator->generateParameterName($property);
        $aliasJoin = $queryNameGenerator->generateJoinAlias($property);

        // If there are more properties in the path, call the function again
        if (sizeof($pathProperties) > 0) {
            $queryBuilder->leftJoin("$alias.$property", $aliasJoin);
            $this->nestedQuery($queryBuilder, $queryNameGenerator, $pathProperties, $aliasJoin, $value);
        } else {
            $queryBuilder
                ->andWhere(sprintf('%s.%s = :%s', $alias, $property, $parameterName))
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
        $description = [];

        foreach ($properties as $property => $strategy) {
            $description[StringFormatHelper::camelToSnake($property)] = array_merge(
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
        $replaceDoubleUnderscore = str_replace('__', '.', $targetProperty);
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
