<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\EmployeeStatusEnum;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bundle\SecurityBundle\Security;

final class ActiveEmployeeExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
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
        $this->addWhere($queryBuilder, $resourceClass, $queryNameGenerator);
    }

    /**
     * @param array<string, mixed> $context
     * @param array<mixed>         $identifiers
     */
    public function applyToItem(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        array $identifiers,
        ?Operation $operation = null,
        array $context = []
    ): void {
        // Items are directly handled by security voters
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass, QueryNameGeneratorInterface $queryNameGenerator): void
    {
        $user = $this->security->getUser();

        if (Employee::class !== $resourceClass || !$user instanceof User) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        // If the user is not an admin or contractor, only return active employees
        if (!$this->security->isGranted(User::ROLE_ADMIN)
            && !$this->security->isGranted(User::ROLE_EMPLOYEE)
            && !$this->security->isGranted(User::ROLE_CONTRACTOR)
        ) {
            $activeParameter = $queryNameGenerator->generateParameterName('active');

            $queryBuilder
                ->andWhere("$rootAlias.status = :$activeParameter")
                ->setParameter("$activeParameter", EmployeeStatusEnum::Active)
            ;
        } elseif ($this->security->isGranted(User::ROLE_CONTRACTOR) || $this->security->isGranted(User::ROLE_EMPLOYEE)) {
            $establishementAlias = $queryNameGenerator->generateJoinAlias('establishment');
            $activeParameter = $queryNameGenerator->generateParameterName('public');
            $userParameter = $queryNameGenerator->generateParameterName('user');

            $queryBuilder
                ->join("$rootAlias.establishment", $establishementAlias)
                ->andWhere($queryBuilder->expr()->orX(
                    "$rootAlias.status = :$activeParameter",
                    "$establishementAlias.contractor = :$userParameter",
                    "$rootAlias.user = :$userParameter",
                ))
                ->setParameter("$activeParameter", EmployeeStatusEnum::Active)
                ->setParameter("$userParameter", $user->getId(), UuidType::NAME)
            ;
        }
    }
}
