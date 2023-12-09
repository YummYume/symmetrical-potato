<?php

namespace App\Security;

use App\Entity\Establishment;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class EstablishmentVoter extends Voter
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

        if (!$subject instanceof Establishment) {
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

        /** @var Establishment $establishment */
        $establishment = $subject;

        return match ($attribute) {
            self::READ => $this->canRead(),
            self::CREATE => $this->canCreate(),
            self::UPDATE => $this->canUpdate($establishment, $user),
            self::DELETE => $this->canDelete($establishment, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(): bool
    {
        // Everyone can read for now
        return true;
    }

    private function canCreate(): bool
    {
        return $this->security->isGranted(User::ROLE_CONTRACTOR);
    }

    private function canUpdate(Establishment $establishment, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $this->security->isGranted(User::ROLE_CONTRACTOR) && $establishment->getContractor() === $user;
    }

    private function canDelete(Establishment $establishment, User $user): bool
    {
        return $this->canUpdate($establishment, $user);
    }
}
