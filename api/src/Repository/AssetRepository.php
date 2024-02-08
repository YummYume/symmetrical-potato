<?php

namespace App\Repository;

use App\Entity\Asset;
use App\Entity\Heist;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Asset>
 *
 * @method Asset|null find($id, $lockMode = null, $lockVersion = null)
 * @method Asset|null findOneBy(array $criteria, array $orderBy = null)
 * @method Asset[]    findAll()
 * @method Asset[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class AssetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Asset::class);
    }

    /**
     * @return Asset[]
     */
    public function findAssetsByHeist(Heist $heist): array
    {
        $qb = $this->createQueryBuilder('a');

        return $qb
            ->leftJoin('a.heistAssets', 'ha')
            ->leftJoin('ha.crewMember', 'cm')
            ->leftJoin('cm.heist', 'h')
            ->where($qb->expr()->eq('h.id', ':heistId'))
            ->setParameters([
                'heistId' => $heist->getId()->toBinary(),
            ])
            ->getQuery()
            ->getResult()
        ;
    }
}
