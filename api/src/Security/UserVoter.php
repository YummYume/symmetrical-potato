<?php

namespace App\Security;

use App\Entity\User;
use App\Enum\UserStatusEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class UserVoter extends Voter
{
    public const READ_PUBLIC = 'READ_PUBLIC';
    public const READ = 'READ';
    public const VALIDATE = 'VALIDATE';
    public const KILL = 'KILL';
    public const REVIVE = 'REVIVE';
    public const UPDATE = 'UPDATE';
    public const DELETE = 'DELETE';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!\in_array($attribute, [
            self::READ_PUBLIC,
            self::READ,
            self::VALIDATE,
            self::KILL,
            self::REVIVE,
            self::UPDATE,
            self::DELETE,
        ], true)) {
            return false;
        }

        if (!$subject instanceof User) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var User $userSubject */
        $userSubject = $subject;

        return match ($attribute) {
            self::READ_PUBLIC => $this->canReadPublic($userSubject, $user),
            self::READ => $this->canRead($userSubject, $user),
            self::VALIDATE => $this->canValidate($userSubject),
            self::KILL => $this->canKill($userSubject),
            self::REVIVE => $this->canRevive($userSubject),
            self::UPDATE => $this->canUpdate($userSubject, $user),
            self::DELETE => $this->canDelete($userSubject, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canReadPublic(User $userSubject, User $user): bool
    {
        if ($this->canRead($userSubject, $user)) {
            return true;
        }

        return UserStatusEnum::Verified === $userSubject->getStatus();
    }

    private function canRead(User $userSubject, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $userSubject === $user;
    }

    private function canValidate(User $userSubject): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN) && UserStatusEnum::Unverified === $userSubject->getStatus();
    }

    private function canKill(User $userSubject): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN) && UserStatusEnum::Verified === $userSubject->getStatus();
    }

    private function canRevive(User $userSubject): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN) && UserStatusEnum::Dead === $userSubject->getStatus();
    }

    private function canUpdate(User $userSubject, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $userSubject === $user && UserStatusEnum::Verified === $userSubject->getStatus();
    }

    private function canDelete(User $userSubject, User $user): bool
    {
        return $this->canUpdate($userSubject, $user);
    }
}
