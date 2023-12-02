<?php

namespace App\Repository;

use App\Entity\Establishment;
use App\Entity\User;
use App\Enum\CrewMemberStatusEnum;
use App\Enum\EmployeeStatusEnum;
use App\Enum\HeistPhaseEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Doctrine\Types\UuidType;

/**
 * @extends ServiceEntityRepository<Establishment>
 *
 * @method Establishment|null find($id, $lockMode = null, $lockVersion = null)
 * @method Establishment|null findOneBy(array $criteria, array $orderBy = null)
 * @method Establishment[]    findAll()
 * @method Establishment[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class EstablishmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Establishment::class);
    }

    /**
     * Will return true if the user is related to the establishment in any way.
     */
    public function userIsRelatedToEstablishment(User $user, Establishment $establishment): bool
    {
        $qb = $this->createQueryBuilder('e');

        return $qb
            ->select('COUNT(e.id)')
            ->leftJoin('e.employees', 'employees', 'WITH', 'employees.status = :active')
            ->leftJoin('employees.user', 'user')
            ->leftJoin('e.heists', 'heists', 'WITH', 'heists.phase in (:phases)')
            ->leftJoin('heists.crewMembers', 'crewMembers', 'WITH', 'crewMembers.status != :dead')
            ->where($qb->expr()->orX(
                $qb->expr()->eq('user', ':user'),
                $qb->expr()->eq('crewMembers.user', ':user'),
                $qb->expr()->eq('e.contractor', ':user'),
            ))
            ->andWhere($qb->expr()->eq('e', ':establishment'))
            ->setParameter('user', $user->getId(), UuidType::NAME)
            ->setParameter('establishment', $establishment->getId(), UuidType::NAME)
            ->setParameter('active', EmployeeStatusEnum::Active)
            ->setParameter('phases', [HeistPhaseEnum::Succeeded, HeistPhaseEnum::Failed])
            ->setParameter('dead', CrewMemberStatusEnum::Dead)
            ->getQuery()
            ->getSingleScalarResult() > 0
        ;
    }
}
