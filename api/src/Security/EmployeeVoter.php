<?php

namespace App\Security;

use App\Entity\Employee;
use App\Entity\User;
use App\Enum\EmployeeStatusEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class EmployeeVoter extends Voter
{
    public const READ_PUBLIC = 'READ_PUBLIC';
    public const READ = 'READ';
    public const CREATE = 'CREATE';
    public const VALIDATE = 'VALIDATE';
    public const UPDATE = 'UPDATE';
    public const DELETE = 'DELETE';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!\in_array($attribute, [self::READ_PUBLIC, self::READ, self::CREATE, self::VALIDATE, self::UPDATE, self::DELETE], true)) {
            return false;
        }

        if (!$subject instanceof Employee) {
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

        /** @var Employee $employee */
        $employee = $subject;

        return match ($attribute) {
            self::READ_PUBLIC => $this->canReadPublic($employee, $user),
            self::READ => $this->canRead($employee, $user),
            self::CREATE => $this->canCreate($user),
            self::VALIDATE => $this->canValidate($employee, $user),
            self::UPDATE => $this->canUpdate($employee, $user),
            self::DELETE => $this->canDelete($employee, $user),
            default => throw new \LogicException('This code should not be reached!')
        };
    }

    private function canReadPublic(Employee $employee, User $user): bool
    {
        if ($this->canRead($employee, $user)) {
            return true;
        }

        return EmployeeStatusEnum::Active === $employee->getStatus();
    }

    private function canRead(Employee $employee, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $employee->getUser() === $user || ($employee->hasContractor($user) && $this->security->isGranted(User::ROLE_CONTRACTOR));
    }

    private function canCreate(User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_CONTRACTOR) || $this->security->isGranted(User::ROLE_EMPLOYEE)) {
            return false;
        }

        return null === $user->getEmployee() || EmployeeStatusEnum::Rejected === $user->getEmployee()->getStatus();
    }

    private function canValidate(Employee $employee, User $user): bool
    {
        return $this->security->isGranted(User::ROLE_CONTRACTOR)
            && $employee->hasContractor($user)
            && EmployeeStatusEnum::Pending === $employee->getStatus()
        ;
    }

    private function canUpdate(Employee $employee, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return $employee->getUser() === $user && EmployeeStatusEnum::Active === $employee->getStatus() && $this->security->isGranted(User::ROLE_EMPLOYEE);
    }

    private function canDelete(Employee $employee, User $user): bool
    {
        if ($this->security->isGranted(User::ROLE_ADMIN)) {
            return true;
        }

        return ($employee->getUser() === $user && $this->security->isGranted(User::ROLE_EMPLOYEE))
            || ($this->security->isGranted(User::ROLE_CONTRACTOR) && $employee->hasContractor($user))
        ;
    }
}
