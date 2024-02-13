<?php

namespace App\Security;

use App\Entity\CrewMember;
use App\Entity\User;
use App\Enum\HeistPhaseEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class CrewMemberVoter extends Voter
{
    public const READ = 'READ';
    public const CREATE = 'CREATE';
    public const DELETE = 'DELETE';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!\in_array($attribute, [self::READ, self::CREATE, self::DELETE], true)) {
            return false;
        }

        if (!$subject instanceof CrewMember) {
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

        /** @var CrewMember $crewMember */
        $crewMember = $subject;

        return match ($attribute) {
            self::READ => $this->canRead(),
            self::CREATE => $this->canCreate($crewMember),
            self::DELETE => $this->canDelete($crewMember, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(): bool
    {
        // Anyone can read
        return true;
    }

    private function canCreate(CrewMember $crewMember): bool
    {
        return $this->security->isGranted(User::ROLE_HEISTER) && HeistPhaseEnum::Planning === $crewMember->getHeist()->getPhase();
    }

    private function canDelete(CrewMember $crewMember, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $this->security->isGranted(User::ROLE_HEISTER)
            && $crewMember->getUser() === $user
            && HeistPhaseEnum::Planning === $crewMember->getHeist()->getPhase()
        ;
    }
}
