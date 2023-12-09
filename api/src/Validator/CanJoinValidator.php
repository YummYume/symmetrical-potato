<?php

namespace App\Validator;

use App\Entity\CrewMember;
use App\Entity\User;
use App\Repository\CrewMemberRepository;
use App\Repository\HeistRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class CanJoinValidator extends ConstraintValidator
{
    public function __construct(
        private readonly HeistRepository $heistRepository,
        private readonly CrewMemberRepository $crewMemberRepository,
        private readonly Security $security,
    ) {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof CanJoin) {
            throw new UnexpectedTypeException($constraint, CanJoin::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof CrewMember) {
            throw new UnexpectedValueException($value, CrewMember::class);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        $heist = $value->getHeist();
        if (null === $heist) {
            return;
        }

        if ($this->crewMemberRepository->findOneBy(['user' => $user, 'heist' => $heist])) {
            $this->context->buildViolation($constraint->message)->addViolation();
        } elseif (!$this->heistRepository->canJoin($user, $heist)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
