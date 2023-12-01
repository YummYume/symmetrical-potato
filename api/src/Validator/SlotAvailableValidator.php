<?php

namespace App\Validator;

use App\Entity\Heist;
use App\Repository\HeistRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class SlotAvailableValidator extends ConstraintValidator
{
    public function __construct(private readonly HeistRepository $heistRepository)
    {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof SlotAvailable) {
            throw new UnexpectedTypeException($constraint, SlotAvailable::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Heist) {
            throw new UnexpectedValueException($value, Heist::class);
        }

        if (!$this->heistRepository->slotAvailable($value)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
