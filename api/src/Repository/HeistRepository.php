<?php

namespace App\Repository;

use App\Entity\Heist;
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
     * Will return if a slot is available for a heist.
     */
    public function slotAvailable(Heist $heist): bool
    {
        $qb = $this->createQueryBuilder('h');
        $count = $qb
            ->select('COUNT(h.id)')
            ->where($qb->expr()->orX(
                'h.phase = :planning',
                'h.phase = :inProgress',
            ))
            ->andWhere('h.location = :location')
            ->andWhere('h.visibility = :visibility')
            ->andWhere('h.shouldEndAt >= :startAt')
            ->andWhere('h.endedAt IS NULL')
            ->setParameters([
                'planning' => HeistPhaseEnum::Planning,
                'inProgress' => HeistPhaseEnum::InProgress,
                'visibility' => HeistVisibilityEnum::Public,
                'startAt' => $heist->getStartAt(),
                'location' => $heist->getLocation()->getId()->toBinary(),
            ])
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return $count === 0;
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
