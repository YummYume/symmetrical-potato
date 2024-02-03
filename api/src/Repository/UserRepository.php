<?php

namespace App\Repository;

use App\Entity\User;
use App\Enum\HeistPhaseEnum;
use App\Enum\UserStatusEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @implements PasswordUpgraderInterface<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
final class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * @return User[]
     */
    public function findUsersWithHeists(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->leftJoin('u.crewMembers', 'cm')
            ->leftJoin('cm.heist', 'h')
            ->where($qb->expr()->orX(
                'h.phase = :success',
                'h.phase = :failure',
            ))
            ->setParameters([
                'success' => HeistPhaseEnum::Succeeded,
                'failure' => HeistPhaseEnum::Failed,
            ])
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return User[]
     */
    public function findAdmins(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->where('u.roles LIKE :role')
            ->setParameter('role', sprintf('%%%s%%', User::ROLE_ADMIN))
            ->getQuery()
            ->getResult()
        ;
    }

    public function findUserByNonExpiredResetToken(string $resetToken): ?User
    {
        $date = new \DateTimeImmutable(sprintf('@%s', time() - User::RESET_TOKEN_TTL));

        return $this->createQueryBuilder('u')
            ->where('u.resetToken = :resetToken')
            ->andWhere('u.resetTokenRequestedAt > :date')
            ->andWhere('u.status = :status')
            ->setParameter('resetToken', $resetToken)
            ->setParameter('date', $date)
            ->setParameter('status', UserStatusEnum::Verified->value)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
