<?php

namespace App\Security;

use App\Entity\HeistAsset;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class HeistAssetVoter extends Voter
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

        if (!$subject instanceof HeistAsset) {
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

        /** @var HeistAsset $heistAsset */
        $heistAsset = $subject;

        return match ($attribute) {
            self::READ => $this->canRead($heistAsset),
            self::CREATE => $this->canCreate($heistAsset, $user),
            self::UPDATE => $this->canUpdate($heistAsset, $user),
            self::DELETE => $this->canDelete($heistAsset, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(HeistAsset $heistAsset): bool
    {
        // TODO
        return true;
    }

    private function canCreate(HeistAsset $heistAsset, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $user === $heistAsset->getCrewMember()->getUser();
    }

    private function canUpdate(HeistAsset $heistAsset, User $user): bool
    {
        // If the user can create the asset, they can also update it
        return $this->canCreate($heistAsset, $user);
    }

    private function canDelete(HeistAsset $heistAsset, User $user): bool
    {
        // If the user can update the asset, they can also delete it
        return $this->canUpdate($heistAsset, $user);
    }
}
