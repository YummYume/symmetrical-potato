<?php

namespace App\Repository;

use App\Entity\HeistAsset;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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
}
