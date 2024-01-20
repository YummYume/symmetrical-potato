<?php

namespace App\Repository;

use App\Entity\Asset;
use App\Entity\HeistAsset;
use App\Enum\HeistPhaseEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Doctrine\Types\UuidType;

/**
 * @extends ServiceEntityRepository<HeistAsset>
 *
 * @method HeistAsset|null find($id, $lockMode = null, $lockVersion = null)
 * @method HeistAsset|null findOneBy(array $criteria, array $orderBy = null)
 * @method HeistAsset[]    findAll()
 * @method HeistAsset[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class HeistAssetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, HeistAsset::class);
    }

    /**
     * @return HeistAsset[]
     */
    public function findHeistAssetsByAsset(Asset $asset, bool $withPlanningHeistsOnly = true): array
    {
        $qb = $this->createQueryBuilder('ha');
        $qb
            ->where($qb->expr()->eq('ha.asset', ':asset'))
            ->setParameter('asset', $asset->getId(), UuidType::NAME)
        ;

        if ($withPlanningHeistsOnly) {
            $qb
                ->leftJoin('ha.crewMember', 'cm')
                ->leftJoin('cm.heist', 'h')
                ->andWhere($qb->expr()->eq('h.phase', ':phase'))
                ->setParameter('phase', HeistPhaseEnum::Planning)
            ;
        }

        return $qb
            ->getQuery()
            ->getResult()
        ;
    }
}
