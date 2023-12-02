<?php

namespace App\Validator;

use App\Entity\Establishment;
use App\Entity\Location;
use App\Entity\User;
use App\Repository\EstablishmentRepository;
use App\Repository\LocationRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class CanReviewValidator extends ConstraintValidator
{
    public function __construct(
        private readonly EstablishmentRepository $establishmentRepository,
        private readonly LocationRepository $locationRepository,
        private readonly Security $security
    ) {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof CanReview) {
            throw new UnexpectedTypeException($constraint, SlotAvailable::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Establishment && !$value instanceof Location) {
            throw new UnexpectedValueException($value, Establishment::class.'|'.Location::class);
        }

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        if ($value instanceof Establishment && !$this->establishmentRepository->userIsRelatedToEstablishment($user, $value)) {
            $this->context->buildViolation($constraint->message)
                ->addViolation()
            ;
        } elseif ($value instanceof Location && !$this->locationRepository->userIsRelatedToLocation($user, $value)) {
            $this->context->buildViolation($constraint->message)
                ->addViolation()
            ;
        }
    }
}
