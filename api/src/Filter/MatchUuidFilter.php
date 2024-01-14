<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\PropertyInfo\Type;
use Symfony\Component\Uid\Uuid;

final class MatchUuidFilter extends AbstractFilter
{
    use UtilsFilterTrait;

    /**
     * @return array<string, mixed>
     */
    public function getDescription(string $resourceClass): array
    {
        $description = [];

        $properties = $this->getProperties();
        if (null === $properties) {
            $properties = array_fill_keys($this->getClassMetadata($resourceClass)->getFieldNames(), null);
        }

        foreach ($properties as $property => $unused) {
            if (!$this->isPropertyMapped($property, $resourceClass)) {
                continue;
            }
            $propertyName = $this->normalizePropertyName($property);
            $description[$propertyName] = [
                'property' => $propertyName,
                'type' => Type::BUILTIN_TYPE_ARRAY,
                'required' => false,
                'openapi' => [
                    'example' => 'If the property is `contractor__id: ["uuid_0", "uuid_1", "uuid_2"]` the filter will be applied a `WHERE contractor.id IN ("uuid_0", "uuid_1", "uuid_2")` clause.',
                    'description' => 'Matches a property uuid against a list of uuids.',
                    'name' => 'Match uuid filter',
                    'type' => Type::BUILTIN_TYPE_ARRAY,
                ],
            ];
        }

        return $description;
    }

    /**
     * @param array<string, mixed> $context
     */
    protected function filterProperty(
        string $property,
        mixed $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        Operation $operation = null,
        array $context = []
    ): void {
        if (!$this->isPropertyEnabled($property, $resourceClass) || !$this->isPropertyMapped($property, $resourceClass)) {
            return;
        }

        // Check if values are valid UUID and convert it to binary
        foreach ($value as $key => $item) {
            try {
                $uuid = Uuid::fromString($this->getIdFromURI($item))->toBinary();
                $value[$key] = $uuid;
            } catch (\Exception $e) {
                return;
            }
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $field = $property;

        if ($this->isPropertyNested($property, $resourceClass)) {
            [$alias, $field] = $this->addJoinsForNestedProperty($property, $alias, $queryBuilder, $queryNameGenerator, $resourceClass, Join::INNER_JOIN);
        }

        $valueParameter = $queryNameGenerator->generateParameterName($field);

        $queryBuilder
            ->andWhere($queryBuilder->expr()->in(sprintf('%s.%s', $alias, $field), ":$valueParameter"))
            ->setParameter($valueParameter, $value)
        ;
    }
}
