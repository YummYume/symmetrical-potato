<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\User;
use App\Enum\UserStatusEnum;
use Doctrine\ORM\QueryBuilder;

final class VerifiedUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    /**
     * Operations that are allowed to access unverified users.
     */
    private const ALLOWED_OPERATIONS = ['validate'];

    /**
     * @param array<string, mixed> $context
     */
    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        Operation $operation = null,
        array $context = []
    ): void {
        $this->addWhere($queryBuilder, $resourceClass, $context);
    }

    /**
     * @param array<string, mixed> $identifiers
     * @param array<string, mixed> $context
     */
    public function applyToItem(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        array $identifiers,
        Operation $operation = null,
        array $context = []
    ): void {
        $this->addWhere($queryBuilder, $resourceClass, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass, array $context): void
    {
        if (User::class !== $resourceClass || \in_array($context['operation_name'], self::ALLOWED_OPERATIONS, true)) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $queryBuilder->andWhere(sprintf('%s.status = :verified', $rootAlias));
        $queryBuilder->setParameter('verified', UserStatusEnum::Verified);
    }
}
