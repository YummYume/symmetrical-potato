<?php

namespace App\Repository;

use App\Entity\ContractorRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ContractorRequest>
 *
 * @method ContractorRequest|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContractorRequest|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContractorRequest[]    findAll()
 * @method ContractorRequest[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class ContractorRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContractorRequest::class);
    }
}
