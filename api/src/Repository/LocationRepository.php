<?php

namespace App\Repository;

use App\Entity\Location;
use App\Entity\User;
use App\Enum\CrewMemberStatusEnum;
use App\Enum\EmployeeStatusEnum;
use App\Enum\HeistPhaseEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Doctrine\Types\UuidType;

/**
 * @extends ServiceEntityRepository<Location>
 *
 * @method Location|null find($id, $lockMode = null, $lockVersion = null)
 * @method Location|null findOneBy(array $criteria, array $orderBy = null)
 * @method Location[]    findAll()
 * @method Location[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class LocationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Location::class);
    }

    /**
     * Will return true if the user is related to the location in any way.
     */
    public function userIsRelatedToLocation(User $user, Location $location): bool
    {
        $qb = $this->createQueryBuilder('l');

        return $qb
            ->select('COUNT(l.id)')
            ->leftJoin('l.heists', 'heists', 'WITH', 'heists.phase in (:phases)')
            ->leftJoin('heists.crewMembers', 'crewMembers', 'WITH', 'crewMembers.status != :dead')
            ->leftJoin('heists.establishment', 'establishment')
            ->leftJoin('establishment.employees', 'employees', 'WITH', 'employees.status = :active')
            ->leftJoin('employees.user', 'user')
            ->where($qb->expr()->orX(
                $qb->expr()->eq('crewMembers.user', ':user'),
                $qb->expr()->eq('user', ':user'),
                $qb->expr()->eq('establishment.contractor', ':user'),
            ))
            ->andWhere($qb->expr()->eq('l', ':location'))
            ->setParameter('user', $user->getId(), UuidType::NAME)
            ->setParameter('location', $location->getId(), UuidType::NAME)
            ->setParameter('phases', [HeistPhaseEnum::Succeeded, HeistPhaseEnum::Failed])
            ->setParameter('dead', CrewMemberStatusEnum::Dead)
            ->setParameter('active', EmployeeStatusEnum::Active)
            ->getQuery()
            ->getSingleScalarResult() > 0
        ;
    }
}
