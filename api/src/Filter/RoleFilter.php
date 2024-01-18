<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\PropertyInfo\Type;

final class RoleFilter extends AbstractFilter
{
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
                'type' => Type::BUILTIN_TYPE_ITERABLE,
                'required' => false,
                'openapi' => [
                    'example' => 'If the property roles: ["ROLE_HEISTER", "ROLE_CONTRACTOR"]` the filter will be applied a `WHERE phase IN ("succeeded", "failed", "cancelled")` clause.',
                    'description' => '',
                    'name' => 'Role filter',
                    'type' => Type::BUILTIN_TYPE_ITERABLE,
                ],
            ];
        }

        return $description;
    }

    public function apply(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        if (isset($context['filters']) && !isset($context['filters'][$this->inc])) {
            return;
        }

        if (!isset($context['filters'][$this->orderParameterName]) || !\is_array($context['filters'][$this->orderParameterName])) {
            parent::apply($queryBuilder, $queryNameGenerator, $resourceClass, $operation, $context);

            return;
        }

        foreach ($context['filters'][$this->orderParameterName] as $property => $value) {
            $this->filterProperty($this->denormalizePropertyName($property), $value, $queryBuilder, $queryNameGenerator, $resourceClass, $operation, $context);
        }
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

        $alias = $queryBuilder->getRootAliases()[0];
        $field = $property;

        $valueParameter = $queryNameGenerator->generateParameterName($field);
        $valueParameter2 = $queryNameGenerator->generateParameterName($field.'2');

        $queryBuilder
            ->andWhere('JSON_CONTAINS('.sprintf('%s.%s', $alias, $field).", :$valueParameter) = 1")
            ->andWhere($queryBuilder->expr()->not('JSON_CONTAINS('.sprintf('%s.%s', $alias, $field).", :$valueParameter2) = 1"))
            ->setParameter($valueParameter, '"'.$value.'"')
            ->setParameter($valueParameter2, '"ROLE_ADMIN"')
            // ->andWhere($queryBuilder->expr()->like(sprintf('%s.%s', $alias, $field), ":$valueParameter"))
            // ->setParameter($valueParameter, "%$value%")
        ;
    }
}
