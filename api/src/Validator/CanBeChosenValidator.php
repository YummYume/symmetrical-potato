<?php

namespace App\Validator;

use App\Entity\Employee;
use App\Entity\Heist;
use App\Enum\EmployeeStatusEnum;
use App\Enum\HeistPhaseEnum;
use App\Repository\HeistRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class CanBeChosenValidator extends ConstraintValidator
{
    public function __construct(private readonly HeistRepository $heistRepository)
    {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof CanBeChosen) {
            throw new UnexpectedTypeException($constraint, CanBeChosen::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Heist) {
            throw new UnexpectedValueException($value, Heist::class);
        }

        $employee = $value->getEmployee();

        if (!$employee) {
            return;
        }

        if (EmployeeStatusEnum::Active !== $employee->getStatus()) {
            $this->context->buildViolation($constraint->message)
                ->addViolation()
            ;

            return;
        }

        $heists = $this->heistRepository->findBy([
            'phase' => HeistPhaseEnum::Planning,
            'employee' => $employee,
        ]);

        foreach ($heists as $activeHeist) {
            if ($value->getStartAt() >= $activeHeist->getStartAt() && $value->getStartAt() <= $activeHeist->getShouldEndAt()) {
                $this->context->buildViolation($constraint->message)
                    ->addViolation()
                ;

                return;
            }

            if ($value->getShouldEndAt() >= $activeHeist->getStartAt() && $value->getShouldEndAt() <= $activeHeist->getShouldEndAt()) {
                $this->context->buildViolation($constraint->message)
                    ->addViolation()
                ;

                return;
            }
        }

        $startAt = $value->getStartAt()->format('H:i');
        $shouldEndAt = $value->getShouldEndAt()->format('H:i');
        $startAtDay = $value->getStartAt()->format('w');
        $day = Employee::DAYS[$startAtDay - 1] ?? Employee::DAYS[0];
        $schedule = $employee->getWeeklySchedule()[$day];

        foreach ($schedule as $shift) {
            if ($shift['startAt'] <= $startAt && $shift['endAt'] >= $shouldEndAt) {
                return;
            }
        }

        $this->context->buildViolation($constraint->message)
            ->addViolation()
        ;
    }
}
