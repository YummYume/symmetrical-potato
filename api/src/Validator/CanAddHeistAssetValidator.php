<?php

namespace App\Validator;

use App\Entity\Heist;
use App\Entity\User;
use App\Enum\HeistPhaseEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class CanAddHeistAssetValidator extends ConstraintValidator
{
    public function __construct(
        private readonly Security $security
    ) {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof CanAddHeistAsset) {
            throw new UnexpectedTypeException($constraint, CanAddHeistAsset::class);
        }

        if (!$value instanceof Heist && null !== $value) {
            throw new UnexpectedValueException($value, Heist::class.'|null');
        }

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        if (!$this->security->isGranted(User::ROLE_ADMIN) && null === $value) {
            $this->context
                ->buildViolation($constraint->mustAddMessage)
                ->addViolation()
            ;

            return;
        }

        if (
            !$this->security->isGranted(User::ROLE_ADMIN)
            && ($user !== $value->getEstablishment()?->getContractor() || HeistPhaseEnum::Planning !== $value->getPhase())
        ) {
            $this->context
                ->buildViolation($constraint->cannotAddMessage)
                ->addViolation()
            ;
        }
    }
}
