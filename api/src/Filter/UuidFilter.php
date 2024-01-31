<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Filter\Traits\URIFilterTrait;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\PropertyInfo\Type;
use Symfony\Component\Uid\Uuid;

final class UuidFilter extends AbstractFilter
{
    use URIFilterTrait;

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

        foreach (array_keys($properties) as $property) {
            if (!$this->isPropertyMapped($property, $resourceClass)) {
                continue;
            }

            foreach (['', 'not.'] as $prefix) {
                $propertyName = $this->normalizePropertyName($property);
                $description[sprintf('%s%s', $prefix, $propertyName)] = [
                    'property' => $propertyName,
                    'type' => Type::BUILTIN_TYPE_STRING,
                    'required' => false,
                    'openapi' => [
                        'example' => 'If the property is "employee__user__id" the filter will be applied to the property "employee.user.id" of the entity. You can also use the notation "not.employee.user.id": this will filter all the entities where the property "employee.user.id" is not equal to the given value.',
                        'description' => 'Recursively filter by UUID',
                        'name' => 'UUID filter',
                        'type' => Type::BUILTIN_TYPE_STRING,
                    ],
                ];
            }
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
        // Check if the property is opposite (not equal)
        $isPropertyOpposite = str_contains($property, 'not.');

        if ($isPropertyOpposite) {
            $property = str_replace('not.', '', $property);
        }

        if (!$this->isPropertyEnabled($property, $resourceClass) || !$this->isPropertyMapped($property, $resourceClass)) {
            return;
        }

        // Check if the value is a valid UUID and convert it to binary
        try {
            $value = Uuid::fromString($this->getIdFromURI($value))->toBinary();
        } catch (\Exception $e) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $field = $property;

        if ($this->isPropertyNested($property, $resourceClass)) {
            [$alias, $field] = $this->addJoinsForNestedProperty($property, $alias, $queryBuilder, $queryNameGenerator, $resourceClass, Join::INNER_JOIN);
        }

        $valueParameter = $queryNameGenerator->generateParameterName($field);

        $operator = $isPropertyOpposite ? '!=' : '=';

        $queryBuilder
            ->andWhere(sprintf('%s.%s $s :%s', $alias, $field, $operator, $valueParameter))
            ->setParameter($valueParameter, $value);
    }
}
