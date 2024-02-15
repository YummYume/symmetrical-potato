<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\EmployeeStatusEnum;
use App\Filter\MatchUuidFilter;
use App\Filter\UuidFilter;
use App\Repository\EmployeeRepository;
use App\State\EmployeeProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: EmployeeProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ, self::READ_PUBLIC, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("READ_PUBLIC", object)',
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ, self::READ_PUBLIC, self::BLAMEABLE, self::TIMESTAMPABLE],
            ]
        ),
        new Mutation(
            name: 'create',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::CREATE],
            ],
            validationContext: [
                'groups' => [self::CREATE],
            ],
            securityPostDenormalize: 'is_granted("CREATE", object)',
        ),
        new Mutation(
            name: 'validate',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::VALIDATE],
            ],
            validationContext: [
                'groups' => [self::VALIDATE],
            ],
            security: 'is_granted("VALIDATE", object)',
        ),
        new Mutation(
            name: 'update',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::UPDATE],
            ],
            validationContext: [
                'groups' => [self::VALIDATE],
            ],
            security: 'is_granted("UPDATE", object)',
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)',
        ),
    ]
)]
#[UniqueEntity(
    fields: ['codeName', 'establishment'],
    message: 'employee.code_name.unique',
    errorPath: 'codeName',
    groups: [self::VALIDATE],
)]
#[ApiFilter(MatchUuidFilter::class, properties: ['establishment.id'])]
#[ApiFilter(UuidFilter::class, properties: ['allowedHeists.id', 'establishment.contractor.id'])]
class Employee
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'employee:read';
    public const READ_PUBLIC = 'employee:read:public';
    public const CREATE = 'employee:create';
    public const VALIDATE = 'employee:validate';
    public const UPDATE = 'employee:update';

    public const PLANNING_REASON_HEIST = 'heist';
    public const PLANNING_REASON_TIME_OFF = 'time_off';

    public const DAY_MONDAY = 'monday';
    public const DAY_TUESDAY = 'tuesday';
    public const DAY_WEDNESDAY = 'wednesday';
    public const DAY_THURSDAY = 'thursday';
    public const DAY_FRIDAY = 'friday';
    public const DAY_SATURDAY = 'saturday';
    public const DAY_SUNDAY = 'sunday';
    public const DAYS = [
        self::DAY_MONDAY,
        self::DAY_TUESDAY,
        self::DAY_WEDNESDAY,
        self::DAY_THURSDAY,
        self::DAY_FRIDAY,
        self::DAY_SATURDAY,
        self::DAY_SUNDAY,
    ];

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    /**
     * @var array<string, array<int, array<string, string>>>
     */
    #[ORM\Column(type: Types::JSON)]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, User::READ, self::CREATE])]
    private array $weeklySchedule = [];

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups([self::READ, self::READ_PUBLIC, User::READ, User::READ_PUBLIC, self::VALIDATE, Heist::READ])]
    #[Assert\When(
        expression: 'this.getStatus() == enum("App\\\Enum\\\EmployeeStatusEnum::Active")',
        constraints: [
            new Assert\NotBlank(
                message: 'employee.code_name.not_blank',
                groups: [self::VALIDATE]
            ),
        ],
        groups: [self::VALIDATE]
    )]
    #[Assert\Length(
        max: 50,
        maxMessage: 'employee.code_name.max_length',
        groups: [self::VALIDATE]
    )]
    private ?string $codeName = null;

    #[ORM\OneToOne(mappedBy: 'employee', targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ])]
    private ?User $user = null;

    /** @var ArrayCollection<int, EmployeeTimeOff> */
    #[ORM\OneToMany(mappedBy: 'employee', targetEntity: EmployeeTimeOff::class, orphanRemoval: true)]
    private Collection $timeOffs;

    #[ORM\ManyToOne(inversedBy: 'employees', targetEntity: Establishment::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::READ_PUBLIC, self::CREATE, User::READ])]
    #[Assert\NotNull(
        message: 'employee.establishment.not_null',
        groups: [self::CREATE]
    )]
    private ?Establishment $establishment = null;

    #[ORM\Column(length: 50, enumType: EmployeeStatusEnum::class)]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, User::READ, self::VALIDATE])]
    #[Assert\Choice(
        choices: [EmployeeStatusEnum::Active, EmployeeStatusEnum::Rejected],
        message: 'employee.status.either_active_or_rejected',
        groups: [self::VALIDATE]
    )]
    private EmployeeStatusEnum $status = EmployeeStatusEnum::Pending;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, User::READ, self::CREATE])]
    #[Assert\NotBlank(
        message: 'employee.motivation.not_blank',
        groups: [self::CREATE]
    )]
    #[Assert\Length(
        min: 10,
        max: 1000,
        minMessage: 'employee.motivation.min_length',
        maxMessage: 'employee.motivation.max_length',
        groups: [self::CREATE]
    )]
    private ?string $motivation = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ, User::READ, self::READ_PUBLIC, self::UPDATE])]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'employee.description.max_length',
        groups: [self::UPDATE]
    )]
    private ?string $description = null;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\ManyToMany(targetEntity: Heist::class, mappedBy: 'allowedEmployees')]
    private Collection $allowedHeists;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\OneToMany(mappedBy: 'employee', targetEntity: Heist::class)]
    private Collection $heists;

    public function __construct()
    {
        $this->timeOffs = new ArrayCollection();
        $this->allowedHeists = new ArrayCollection();
        $this->heists = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    /**
     * @return array<string, array<int, array<string, string>>>
     */
    public function getWeeklySchedule(): array
    {
        return $this->weeklySchedule;
    }

    /**
     * @param array<string, array<int, array<string, string>>> $weeklySchedule
     */
    public function setWeeklySchedule(array $weeklySchedule): static
    {
        $this->weeklySchedule = $weeklySchedule;

        return $this;
    }

    public function getCodeName(): ?string
    {
        return $this->codeName;
    }

    public function setCodeName(?string $codeName): static
    {
        $this->codeName = $codeName;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        // unset the owning side of the relation if necessary
        if (null === $user && null !== $this->user) {
            $this->user->setEmployee(null);
        }

        // set the owning side of the relation if necessary
        if (null !== $user && $user->getEmployee() !== $this) {
            $user->setEmployee($this);
        }

        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, EmployeeTimeOff>
     */
    public function getTimeOffs(): Collection
    {
        return $this->timeOffs;
    }

    public function addTimeOff(EmployeeTimeOff $timeOff): static
    {
        if (!$this->timeOffs->contains($timeOff)) {
            $this->timeOffs->add($timeOff);
            $timeOff->setEmployee($this);
        }

        return $this;
    }

    public function removeTimeOff(EmployeeTimeOff $timeOff): static
    {
        if ($this->timeOffs->removeElement($timeOff)) {
            // set the owning side to null (unless already changed)
            if ($timeOff->getEmployee() === $this) {
                $timeOff->setEmployee(null);
            }
        }

        return $this;
    }

    public function getEstablishment(): ?Establishment
    {
        return $this->establishment;
    }

    public function setEstablishment(?Establishment $establishment): static
    {
        $this->establishment = $establishment;

        return $this;
    }

    public function getStatus(): EmployeeStatusEnum
    {
        return $this->status;
    }

    public function setStatus(EmployeeStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getMotivation(): ?string
    {
        return $this->motivation;
    }

    public function setMotivation(?string $motivation): static
    {
        $this->motivation = $motivation;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return Collection<int, Heist>
     */
    public function getAllowedHeists(): Collection
    {
        return $this->allowedHeists;
    }

    public function addAllowedHeist(Heist $allowedHeist): static
    {
        if (!$this->allowedHeists->contains($allowedHeist)) {
            $this->allowedHeists->add($allowedHeist);
            $allowedHeist->addAllowedEmployee($this);
        }

        return $this;
    }

    public function removeAllowedHeist(Heist $allowedHeist): static
    {
        if ($this->allowedHeists->removeElement($allowedHeist)) {
            $allowedHeist->removeAllowedEmployee($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Heist>
     */
    public function getHeists(): Collection
    {
        return $this->heists;
    }

    public function addHeist(Heist $heist): static
    {
        if (!$this->heists->contains($heist)) {
            $this->heists->add($heist);
            $heist->setEmployee($this);
        }

        return $this;
    }

    public function removeHeist(Heist $heist): static
    {
        if ($this->heists->removeElement($heist)) {
            // set the owning side to null (unless already changed)
            if ($heist->getEmployee() === $this) {
                $heist->setEmployee(null);
            }
        }

        return $this;
    }

    public function hasContractor(User $user): bool
    {
        return $this->establishment?->getContractor() === $user;
    }

    /**
     * @return array<string, array<int, array<string, string>>>
     */
    #[ApiProperty(security: 'is_granted("READ", object)')]
    #[Groups([self::READ_PUBLIC, self::READ, User::READ])]
    public function getPlanning(): array
    {
        $planning = [];

        if (EmployeeStatusEnum::Active !== $this->status) {
            return $planning;
        }

        $year = (int) (new \DateTimeImmutable())->format('Y');
        $week = (int) (new \DateTimeImmutable())->format('W');

        foreach (self::DAYS as $day) {
            $heists = $this->heists->filter(
                static fn (Heist $heist): bool => (int) $heist->getStartAt()->format('Y') === (int) $year && (int) $heist->getStartAt()->format('W') === (int) $week && strtolower($heist->getStartAt()->format('l')) === $day
            );

            foreach ($heists as $heist) {
                $planning[$day][] = [
                    'reason' => self::PLANNING_REASON_HEIST,
                    'startAt' => $heist->getStartAt()->format('H:i'),
                    'endAt' => $heist->getShouldEndAt()->format('H:i'),
                    'heist' => [
                        'id' => $heist->getId(),
                        'name' => $heist->getName(),
                        'location' => $heist->getLocation()->getPlaceId(),
                    ],
                ];
            }

            $timeOffs = $this->timeOffs->filter(
                static fn (EmployeeTimeOff $timeOff) => (int) $timeOff->getStartAt()->format('Y') === (int) $year && (int) $timeOff->getStartAt()->format('W') === (int) $week && strtolower($timeOff->getStartAt()->format('l')) === $day
            );

            foreach ($timeOffs as $timeOff) {
                $planning[$day][] = [
                    'reason' => self::PLANNING_REASON_TIME_OFF,
                    'startAt' => $timeOff->getStartAt()->format('H:i'),
                    'endAt' => $timeOff->getEndAt()->format('H:i'),
                    'timeOff' => [
                        'id' => $timeOff->getId(),
                        'reason' => $timeOff->getReason(),
                    ],
                ];
            }
        }

        return $planning;
    }

    /**
     * Validates the weekly schedule.
     */
    #[Assert\Callback(groups: [self::CREATE])]
    public function validateWeeklySchedule(ExecutionContextInterface $context): void
    {
        /**
         * @var array<string, array<int, array<string, string>>|string>
         */
        $weeklySchedule = $this->getWeeklySchedule();
        $totalHours = 0;

        foreach (self::DAYS as $day) {
            // Validate if all days are present
            if (!isset($weeklySchedule[$day]) || !\is_array($weeklySchedule[$day])) {
                $context->buildViolation('employee.weekly_schedule.missing_day')
                    ->atPath('weeklySchedule')
                    ->setParameter('{{ day }}', $day)
                    ->addViolation()
                ;

                continue;
            }

            $daySchedule = $weeklySchedule[$day];
            $schedulesForDay = [];
            $i = 0;

            foreach ($daySchedule as $schedule) {
                ++$i;
                $entry = (string) $i;

                // Validate if all required fields are present
                if (!isset($schedule['startAt']) || !isset($schedule['endAt'])) {
                    $context->buildViolation('employee.weekly_schedule.missing_start_at_or_end_at')
                        ->atPath('weeklySchedule')
                        ->setParameter('{{ day }}', $day)
                        ->setParameter('{{ entry }}', $entry)
                        ->addViolation()
                    ;

                    continue;
                }

                $startAt = $schedule['startAt'];
                $startAtNumbers = explode(':', $startAt);
                $endAt = $schedule['endAt'];
                $endAtNumbers = explode(':', $endAt);

                // Validate if both have 2 numbers
                if (2 !== \count($startAtNumbers) || 2 !== \count($endAtNumbers)) {
                    $context->buildViolation('employee.weekly_schedule.invalid_start_at_or_end_at')
                        ->atPath('weeklySchedule')
                        ->setParameter('{{ day }}', $day)
                        ->setParameter('{{ entry }}', $entry)
                        ->addViolation()
                    ;

                    continue;
                }

                // Validate if both are valid hours (e.g. 00:00 - 23:59)
                if ($startAtNumbers[0] < 0 || $startAtNumbers[0] > 23 || $startAtNumbers[1] < 0 || $startAtNumbers[1] > 59) {
                    $context->buildViolation('employee.weekly_schedule.invalid_start_at_or_end_at')
                        ->atPath('weeklySchedule')
                        ->setParameter('{{ day }}', $day)
                        ->setParameter('{{ entry }}', $entry)
                        ->addViolation()
                    ;

                    continue;
                }

                if ($endAtNumbers[0] < 0 || $endAtNumbers[0] > 23 || $endAtNumbers[1] < 0 || $endAtNumbers[1] > 59) {
                    $context->buildViolation('employee.weekly_schedule.invalid_start_at_or_end_at')
                        ->atPath('weeklySchedule')
                        ->setParameter('{{ day }}', $day)
                        ->setParameter('{{ entry }}', $entry)
                        ->addViolation()
                    ;

                    continue;
                }

                $startAtDate = new \DateTimeImmutable($startAt);
                $endAtDate = new \DateTimeImmutable($endAt);

                // Validate if startAt is before endAt
                if ($startAtDate >= $endAtDate) {
                    $context->buildViolation('employee.weekly_schedule.start_at_after_end_at')
                        ->atPath('weeklySchedule')
                        ->setParameter('{{ day }}', $day)
                        ->setParameter('{{ entry }}', $entry)
                        ->addViolation()
                    ;

                    continue;
                }

                $hasOverlap = false;

                // Validate if there are no overlaps (e.g. 00:00 - 01:00 and 00:30 - 01:30)
                foreach ($schedulesForDay as $scheduleForDay) {
                    $scheduleForDayStartAt = new \DateTimeImmutable($scheduleForDay['startAt']);
                    $scheduleForDayEndAt = new \DateTimeImmutable($scheduleForDay['endAt']);

                    if (($startAtDate >= $scheduleForDayStartAt && $startAtDate < $scheduleForDayEndAt)
                        || ($endAtDate > $scheduleForDayStartAt && $endAtDate <= $scheduleForDayEndAt)
                    ) {
                        $hasOverlap = true;
                        $context->buildViolation('employee.weekly_schedule.overlap')
                            ->atPath('weeklySchedule')
                            ->setParameter('{{ day }}', $day)
                            ->setParameter('{{ entry }}', $entry)
                            ->setParameter('{{ startAt }}', $startAt)
                            ->setParameter('{{ endAt }}', $endAt)
                            ->setParameter('{{ scheduleForDayStartAt }}', $scheduleForDay['startAt'])
                            ->setParameter('{{ scheduleForDayEndAt }}', $scheduleForDay['endAt'])
                            ->addViolation()
                        ;
                    }
                }

                if ($hasOverlap) {
                    continue;
                }

                $schedulesForDay[] = $schedule;
                $totalHours += $endAtDate->diff($startAtDate)->h;
            }
        }

        // Validate if total hours is more than minimum
        if ($totalHours < $this->getEstablishment()?->getMinimumWorkTimePerWeek()) {
            $context->buildViolation('employee.weekly_schedule.total_hours_less_than_minimum')
                ->atPath('weeklySchedule')
                ->setParameter('{{ totalHours }}', (string) $totalHours)
                ->setParameter('{{ minimumWorkTimePerWeek }}', (string) $this->getEstablishment()?->getMinimumWorkTimePerWeek())
                ->addViolation()
            ;
        }
    }
}
