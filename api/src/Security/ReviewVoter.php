<?php

namespace App\Security;

use App\Entity\Review;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ReviewVoter extends Voter
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

        if (!$subject instanceof Review) {
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

        /** @var Review $review */
        $review = $subject;

        return match ($attribute) {
            self::UPDATE => $this->canUpdate($review, $user),
            self::DELETE => $this->canDelete($review, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canUpdate(Review $review, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $review->getUser() === $user;
    }

    private function canDelete(Review $review, User $user): bool
    {
        return $this->canUpdate($review, $user);
    }
}
