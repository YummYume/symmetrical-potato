<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Employee;
use App\Entity\Profile;
use App\Entity\User;
use App\Enum\UserStatusEnum;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class VerifiedUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    /**
     * Operations that are allowed to access unverified users.
     */
    private const ALLOWED_OPERATIONS = ['validate', 'kill', 'revive'];

    public function __construct(private readonly Security $security)
    {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        $this->addWhere($queryBuilder, $resourceClass, $context, $queryNameGenerator);
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
        ?Operation $operation = null,
        array $context = []
    ): void {
        $this->addWhere($queryBuilder, $resourceClass, $context, $queryNameGenerator);
    }

    /**
     * @param array<string, mixed> $context
     */
    private function addWhere(
        QueryBuilder $queryBuilder,
        string $resourceClass,
        array $context,
        QueryNameGeneratorInterface $queryNameGenerator
    ): void {
        if (
            !\in_array($resourceClass, [User::class, Profile::class, Employee::class], true)
            || $this->security->isGranted(User::ROLE_ADMIN)
            || \in_array($context['operation_name'] ?? [], self::ALLOWED_OPERATIONS, true)
        ) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $verifiedParameter = $queryNameGenerator->generateParameterName('verified');

        if (Profile::class === $resourceClass || Employee::class === $resourceClass) {
            $userAlias = $queryNameGenerator->generateJoinAlias('user');

            $queryBuilder
                ->join(sprintf('%s.user', $rootAlias), $userAlias)
                ->andWhere(sprintf('%s.status = :%s', $userAlias, $verifiedParameter))
                ->setParameter($verifiedParameter, UserStatusEnum::Verified)
            ;

            return;
        }

        $queryBuilder
            ->andWhere(sprintf('%s.status = :%s', $rootAlias, $verifiedParameter))
            ->setParameter($verifiedParameter, UserStatusEnum::Verified)
        ;
    }
}
