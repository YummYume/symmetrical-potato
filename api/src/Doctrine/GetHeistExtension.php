<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Heist;
use App\Entity\User;
use App\Enum\HeistVisibilityEnum;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class GetHeistExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    /**
     * @param array<string, mixed> $context
     * @param array<mixed>         $identifiers
     */
    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        $user = $this->security->getUser();

        if (Heist::class !== $resourceClass || !$user instanceof User) {
            return;
        }

        if (!$this->security->isGranted(User::ROLE_ADMIN) && !$this->security->isGranted(User::ROLE_CONTRACTOR)) {
            $rootAlias = $queryBuilder->getRootAliases()[0];
            $queryBuilder->andWhere("$rootAlias.visibility = :visibility");
            $queryBuilder->setParameter('visibility', HeistVisibilityEnum::Public);
        }
    }
}