<?php

namespace App\Security;

use App\Entity\Heist;
use App\Entity\User;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistVisibilityEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class HeistVoter extends Voter
{
    public const READ = 'READ';
    public const CREATE = 'CREATE';
    public const UPDATE = 'UPDATE';
    public const DELETE = 'DELETE';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!\in_array($attribute, [self::READ, self::CREATE, self::UPDATE, self::DELETE], true)) {
            return false;
        }

        if (!$subject instanceof Heist) {
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

        /** @var Heist $heist */
        $heist = $subject;

        return match ($attribute) {
            self::READ => $this->canRead($heist, $user),
            self::CREATE => $this->canCreate($heist, $user),
            self::UPDATE => $this->canUpdate($heist, $user),
            self::DELETE => $this->canDelete($heist, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(Heist $heist, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN) || HeistVisibilityEnum::Public === $heist->getVisibility()) {
            return true;
        }

        return $heist->getEstablishment()->getContractor() === $user;
    }

    private function canCreate(Heist $heist, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $heist->getEstablishment()->getContractor() === $user && $this->security->isGranted(User::ROLE_CONTRACTOR);
    }

    private function canUpdate(Heist $heist, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $this->security->isGranted(User::ROLE_CONTRACTOR)
            && $heist->getEstablishment()->getContractor() === $user
            && HeistPhaseEnum::Planning === $heist->getPhase()
        ;
    }

    private function canDelete(Heist $heist, User $user): bool
    {
        return $this->canUpdate($heist, $user);
    }
}
