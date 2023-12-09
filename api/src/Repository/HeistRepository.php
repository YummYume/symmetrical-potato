<?php

namespace App\Repository;

use App\Entity\Heist;
use App\Entity\User;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistVisibilityEnum;
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

    /**
     * Will return if a slot is available for a public heist.
     */
    public function slotAvailable(Heist $heist): bool
    {
        $qb = $this->createQueryBuilder('h');
        $count = $qb
            ->select('COUNT(h.id)')
            ->leftJoin('h.location', 'l')
            ->where($qb->expr()->orX(
                'h.phase = :planning',
                'h.phase = :inProgress',
            ))
            ->andWhere($qb->expr()->andX(
                'l.latitude = :latitude',
                'l.longitude = :longitude',
            ))
            ->andWhere($qb->expr()->andX(
                'h.shouldEndAt >= :startAt',
                'h.startAt <= :shouldEndAt',
            ))
            ->andWhere('h.visibility = :visibility')
            ->andWhere('h.endedAt IS NULL')
            ->setParameters([
                'planning' => HeistPhaseEnum::Planning,
                'inProgress' => HeistPhaseEnum::InProgress,
                'visibility' => HeistVisibilityEnum::Public,
                'startAt' => $heist->getStartAt(),
                'shouldEndAt' => $heist->getShouldEndAt(),
                'latitude' => $heist->getLocation() ? $heist->getLocation()->getLatitude() : $heist->getLatitude(),
                'longitude' => $heist->getLocation() ? $heist->getLocation()->getLongitude() : $heist->getLongitude(),
            ])
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return 0 === $count;
    }

    /**
     * Check if the user can join the heist.
     */
    public function canJoin(User $user, Heist $heist): bool
    {
        $qb = $this->createQueryBuilder('h');

        return 0 === $qb
            ->select('COUNT(h.id)')
            ->leftJoin('h.crewMembers', 'cm')
            ->where('cm.user = :userId')
            ->andWhere($qb->expr()->andX(
                'h.phase = :planning',
                'h.visibility = :public',
            ))
            ->andWhere(
                $qb->expr()->orX(
                    // Get heist who starts and ends during the current heist
                    $qb->expr()->andX(
                        $qb->expr()->between('h.startAt', ':startAt', ':shouldEndAt'),
                        $qb->expr()->between('h.shouldEndAt', ':startAt', ':shouldEndAt'),
                    ),
                    // Get heist who ends during the current heist
                    $qb->expr()->andX(
                        $qb->expr()->not($qb->expr()->between('h.startAt', ':startAt', ':shouldEndAt')),
                        $qb->expr()->between('h.shouldEndAt', ':startAt', ':shouldEndAt'),
                    ),
                    // Get heist who starts during the current heist
                    $qb->expr()->andX(
                        $qb->expr()->between('h.startAt', ':startAt', ':shouldEndAt'),
                        $qb->expr()->not($qb->expr()->between('h.shouldEndAt', ':startAt', ':shouldEndAt')),
                    ),
                    // Get heist who starts before and ends after the current heist
                    $qb->expr()->andX(
                        $qb->expr()->lte('h.startAt', ':startAt'),
                        $qb->expr()->gte('h.shouldEndAt', ':shouldEndAt'),
                    )
                )
            )
            ->setParameters([
                'userId' => $user->getId()->toBinary(),
                'startAt' => $heist->getStartAt(),
                'shouldEndAt' => $heist->getShouldEndAt(),
                'planning' => HeistPhaseEnum::Planning,
                'public' => HeistVisibilityEnum::Public,
            ])
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Will return all unprocessed and ongoing heists.
     *
     * @return Heist[]
     */
    public function findUnprocessedOngoingHeists(): array
    {
        return $this->createQueryBuilder('h')
            ->where('h.phase = :phase')
            ->andWhere('h.startAt <= :now')
            ->andWhere('h.shouldEndAt > :now')
            ->andWhere('h.endedAt IS NULL')
            ->setParameters([
                'phase' => HeistPhaseEnum::Planning,
                'now' => new \DateTimeImmutable(),
            ])
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * Will return all unprocessed and finished heists.
     *
     * @return Heist[]
     */
    public function findUnprocessedFinishedHeists(): array
    {
        $qb = $this->createQueryBuilder('h');

        return $qb
            ->where($qb->expr()->orX(
                'h.phase = :planning',
                'h.phase = :inProgress',
            ))
            ->andWhere('h.startAt < :now')
            ->andWhere('h.shouldEndAt <= :now')
            ->andWhere('h.endedAt IS NULL')
            ->setParameters([
                'planning' => HeistPhaseEnum::Planning,
                'inProgress' => HeistPhaseEnum::InProgress,
                'now' => new \DateTimeImmutable(),
            ])
            ->getQuery()
            ->getResult()
        ;
    }
}
