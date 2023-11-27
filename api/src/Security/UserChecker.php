<?php

namespace App\Security;

use App\Entity\User;
use App\Enum\UserStatusEnum;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

final class UserChecker implements UserCheckerInterface
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if (UserStatusEnum::Verified !== $user->getStatus()) {
            throw new CustomUserMessageAccountStatusException($this->translator->trans('user.account_inactive', domain: 'security'));
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
    }
}
