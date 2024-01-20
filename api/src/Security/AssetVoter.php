<?php

namespace App\Security;

use App\Entity\Asset;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class AssetVoter extends Voter
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

        if (!$subject instanceof Asset) {
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

        /** @var Asset $asset */
        $asset = $subject;

        return match ($attribute) {
            self::READ => $this->canRead($asset),
            self::CREATE => $this->canCreate(),
            self::UPDATE => $this->canUpdate($asset),
            self::DELETE => $this->canDelete($asset),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(Asset $asset): bool
    {
        if (null === $asset->getHeist()) {
            return true;
        }

        return $this->security->isGranted(HeistVoter::READ, $asset->getHeist());
    }

    private function canCreate(): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN) || $this->security->isGranted(User::ROLE_CONTRACTOR);
    }

    private function canUpdate(Asset $asset): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        // If the user can update the asset's establishment, they can also update the asset
        return $this->security->isGranted(HeistVoter::UPDATE, $asset->getHeist());
    }

    private function canDelete(Asset $asset): bool
    {
        // If the user can update the asset, they can also delete it
        return $this->canUpdate($asset);
    }
}
