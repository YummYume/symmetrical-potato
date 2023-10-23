<?php

namespace App\Repository;

use App\Entity\EmployeeTimeOff;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EmployeeTimeOff>
 *
 * @method EmployeeTimeOff|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmployeeTimeOff|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmployeeTimeOff[]    findAll()
 * @method EmployeeTimeOff[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class EmployeeTimeOffRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeTimeOff::class);
    }
}
