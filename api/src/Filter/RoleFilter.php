<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\PropertyInfo\Type;

final class RoleFilter extends AbstractFilter
{
    public const INCLUDE_PARAMETER_NAME = 'include';
    public const EXCLUDE_PARAMETER_NAME = 'exclude';

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
            $description[sprintf('%s[%s]', $propertyName, RoleFilter::INCLUDE_PARAMETER_NAME)] = [
                'property' => $propertyName,
                'type' => Type::BUILTIN_TYPE_STRING,
                'required' => true,
                'schema' => [
                    'type' => Type::BUILTIN_TYPE_STRING,
                    'enum' => [
                        strtolower(User::ROLE_ADMIN),
                        strtolower(User::ROLE_CONTRACTOR),
                        strtolower(User::ROLE_EMPLOYEE),
                        strtolower(User::ROLE_HEISTER),
                        strtolower(User::ROLE_USER),
                    ],
                ],
                'openapi' => [
                    'name' => 'Role filter',
                    'type' => Type::BUILTIN_TYPE_STRING,
                    'description' => 'Matches a property role against a list of roles.',
                    'example' => 'If the property is `roles: { include: "ROLE_HEISTER" }` the filter will be applied a `WHERE JSON_CONTAINS(roles, "ROLE_HEISTER") = 1` clause.',
                    'schema' => [
                        'type' => Type::BUILTIN_TYPE_STRING,
                        'enum' => [
                            strtolower(User::ROLE_ADMIN),
                            strtolower(User::ROLE_CONTRACTOR),
                            strtolower(User::ROLE_EMPLOYEE),
                            strtolower(User::ROLE_HEISTER),
                            strtolower(User::ROLE_USER),
                        ],
                    ],
                ],
            ];
            $description[sprintf('%s[%s]', $propertyName, RoleFilter::EXCLUDE_PARAMETER_NAME)] = [
                'property' => $propertyName,
                'type' => Type::BUILTIN_TYPE_ARRAY,
                'required' => false,
                'schema' => [
                    'type' => Type::BUILTIN_TYPE_ARRAY,
                    'items' => [
                        'type' => Type::BUILTIN_TYPE_STRING,
                        'enum' => [
                            strtolower(User::ROLE_ADMIN),
                            strtolower(User::ROLE_CONTRACTOR),
                            strtolower(User::ROLE_EMPLOYEE),
                            strtolower(User::ROLE_HEISTER),
                            strtolower(User::ROLE_USER),
                        ],
                    ],
                ],
                'openapi' => [
                    'name' => 'Role filter',
                    'type' => Type::BUILTIN_TYPE_ARRAY,
                    'description' => 'Matches a property role against a list of roles.',
                    'example' => 'If the property is `roles: { include: "ROLE_HEISTER", exclude: ["ROLE_ADMIN", "ROLE_CONTRACTOR"] }` the filter will be applied a `WHERE JSON_CONTAINS(roles, "ROLE_HEISTER") = 1 AND JSON_CONTAINS(roles, "ROLE_ADMIN") = 0 AND JSON_CONTAINS(roles, "ROLE_CONTRACTOR") = 0` clause.',
                    'schema' => [
                        'type' => Type::BUILTIN_TYPE_ARRAY,
                        'items' => [
                            'type' => Type::BUILTIN_TYPE_STRING,
                            'enum' => [
                                strtolower(User::ROLE_ADMIN),
                                strtolower(User::ROLE_CONTRACTOR),
                                strtolower(User::ROLE_EMPLOYEE),
                                strtolower(User::ROLE_HEISTER),
                                strtolower(User::ROLE_USER),
                            ],
                        ],
                    ],
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

        if (null === $value) {
            return;
        }

        /**
         * @var string $include
         */
        $include = $value[RoleFilter::INCLUDE_PARAMETER_NAME];

        /**
         * @var array<string> $exclude
         */
        $exclude = $value[RoleFilter::EXCLUDE_PARAMETER_NAME] ?? [];

        if (null === $include || !\in_array($include, User::ROLES, true)) {
            return;
        }

        if (\count($exclude) > 0) {
            foreach ($exclude as $role) {
                if (!\in_array($role, User::ROLES, true)) {
                    return;
                }
            }
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $field = $property;

        $valueParameter = $queryNameGenerator->generateParameterName($field);

        $queryBuilder
            ->andWhere(sprintf('JSON_CONTAINS(%s.%s, :%s) = 1', $alias, $field, $valueParameter))
            ->setParameter($valueParameter, sprintf('"%s"', $include))
        ;

        foreach ($exclude as $key => $role) {
            $valueParameter = $queryNameGenerator->generateParameterName($field.$key);

            $queryBuilder
                ->andWhere($queryBuilder->expr()->not(sprintf('JSON_CONTAINS(%s.%s, :%s) = 1', $alias, $field, $valueParameter)))
                ->setParameter($valueParameter, sprintf('"%s"', $role))
            ;
        }
    }
}
