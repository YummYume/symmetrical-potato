<?php

namespace App\Security;

use App\Entity\ContractorRequest;
use App\Entity\User;
use App\Enum\ContractorRequestStatusEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ContractorRequestVoter extends Voter
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

        if (!$subject instanceof ContractorRequest) {
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

        /** @var ContractorRequest $contractorRequest */
        $contractorRequest = $subject;

        return match ($attribute) {
            self::READ => $this->canRead($contractorRequest, $user),
            self::CREATE => $this->canCreate($user),
            self::UPDATE => $this->canUpdate($contractorRequest),
            self::DELETE => $this->canDelete($contractorRequest, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canRead(ContractorRequest $contractorRequest, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $contractorRequest->getUser() === $user;
    }

    private function canCreate(User $user): bool
    {
        return !$this->security->isGranted(User::ROLE_CONTRACTOR)
            && (null === $user->getContractorRequest() || ContractorRequestStatusEnum::Rejected === $user->getContractorRequest()->getStatus());
    }

    private function canUpdate(ContractorRequest $contractorRequest): bool
    {
        return $this->security->isGranted(User::ROLE_ADMIN) && ContractorRequestStatusEnum::Pending === $contractorRequest->getStatus();
    }

    private function canDelete(ContractorRequest $contractorRequest, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $contractorRequest->getUser() === $user && ContractorRequestStatusEnum::Accepted !== $contractorRequest->getStatus();
    }
}
