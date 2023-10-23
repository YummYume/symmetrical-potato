<?php

namespace App\Repository;

use App\Entity\Heist;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Heist>
 *
 * @method Heist|null find($id, $lockMode = null, $lockVersion = null)
 * @method Heist|null findOneBy(array $criteria, array $orderBy = null)
 * @method Heist[]    findAll()
 * @method Heist[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class HeistRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Heist::class);
    }
}
