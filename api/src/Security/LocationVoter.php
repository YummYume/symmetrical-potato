<?php

namespace App\Security;

use App\Entity\Location;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class LocationVoter extends Voter
{
    public const UPDATE = 'UPDATE';
    public const DELETE = 'DELETE';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!\in_array($attribute, [self::UPDATE, self::DELETE], true)) {
            return false;
        }

        if (!$subject instanceof Location) {
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

        return match ($attribute) {
            self::UPDATE => $this->canUpdate(),
            self::DELETE => $this->canDelete(),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canUpdate(): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN);
    }

    private function canDelete(): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN);
    }
}
