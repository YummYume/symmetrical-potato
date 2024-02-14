<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistPreferedTacticEnum;
use App\Enum\HeistVisibilityEnum;
use App\Filter\MatchFilter;
use App\Filter\MatchUuidFilter;
use App\Filter\UuidFilter;
use App\Repository\HeistRepository;
use App\State\HeistProcessor;
use App\Validator\CanBeChosen;
use App\Validator\SlotAvailable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: HeistRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: HeistProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("READ", object)',
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
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
            securityPostDenormalize: 'is_granted("CREATE", object)'
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
                'groups' => [self::UPDATE],
            ],
            security: 'is_granted("UPDATE", object)'
        ),
        new Mutation(
            name: 'chooseEmployee',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::CHOOSE_EMPLOYEE],
            ],
            validationContext: [
                'groups' => [self::CHOOSE_EMPLOYEE],
            ],
            security: 'is_granted("CHOOSE_EMPLOYEE", object)'
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)'
        ),
    ]
)]
#[SlotAvailable(groups: [self::CREATE, self::UPDATE])]
#[CanBeChosen(groups: [self::CHOOSE_EMPLOYEE])]
#[ApiFilter(MatchFilter::class, properties: ['phase', 'difficulty', 'visibility', 'preferedTactic'])]
#[ApiFilter(MatchUuidFilter::class, properties: ['establishment.id'])]
#[ApiFilter(UuidFilter::class, properties: ['establishment.contractor.id', 'employee.user.id', 'crewMembers.user.id'])]
#[ApiFilter(SearchFilter::class, properties: ['location.placeId' => 'exact'])]
#[ApiFilter(DateFilter::class, properties: ['startAt', 'shouldEndAt'])]
#[ApiFilter(RangeFilter::class, properties: ['minimumPayout', 'maximumPayout'])]
class Heist
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'heist:read';
    public const READ_PUBLIC = 'heist:read:public';
    public const CREATE = 'heist:create';
    public const UPDATE = 'heist:update';
    public const CHOOSE_EMPLOYEE = 'heist:choose:employee';

    public const MAX_ALLOWED_CREW_MEMBERS = 4;
    public const MAX_OBJECTIVES_PER_HEIST = 20;
    public const MAX_CIVILIAN_CASUALTIES_PER_HEIST = 50;
    public const MAX_COP_KILLS_PER_HEIST = 1000;
    public const CIVILIAN_CLEANUP_COST = 1000;
    public const CREATE_HEIST_PRICE = 15000;
    public const PERCENTAGE_REFUND = 0.5;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.minimum_payout.not_blank')]
    #[Assert\Type(groups: [self::CREATE, self::UPDATE], type: 'float', message: 'heist.minimum_payout.invalid')]
    private ?float $minimumPayout = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.maximum_payout.not_blank')]
    #[Assert\Type(groups: [self::CREATE, self::UPDATE], type: 'float', message: 'heist.maximum_payout.invalid')]
    private ?float $maximumPayout = null;

    #[ORM\Column]
    #[Groups([self::READ, self::READ_PUBLIC, self::CREATE, self::UPDATE, Asset::READ])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.name.not_blank')]
    #[Assert\Length(
        groups: [self::CREATE, self::UPDATE],
        min: 2,
        max: 100,
        minMessage: 'heist.name.min_length',
        maxMessage: 'heist.name.max_length'
    )]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.description.not_blank')]
    #[Assert\Length(
        groups: [self::CREATE, self::UPDATE],
        min: 10,
        max: 255,
        minMessage: 'heist.description.min_length',
        maxMessage: 'heist.description.max_length'
    )]
    private ?string $description = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.start_date.not_blank')]
    #[Assert\Type(type: "\DateTimeInterface", groups: [self::CREATE, self::UPDATE], message: 'heist.start_date.invalid')]
    #[Assert\LessThan(
        groups: [self::CREATE, self::UPDATE],
        propertyPath: 'shouldEndAt',
        message: 'heist.start_date.less_than.should_end_date'
    )]
    #[Assert\GreaterThanOrEqual(
        groups: [self::CREATE, self::UPDATE],
        value: 'now',
        message: 'heist.start_date.greater_than_equal.today'
    )]
    private ?\DateTimeInterface $startAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'heist.should_end_date.not_blank')]
    #[Assert\Type(type: "\DateTimeInterface", groups: [self::CREATE, self::UPDATE], message: 'heist.should_end_date.invalid')]
    #[Assert\GreaterThan(
        groups: [self::CREATE, self::UPDATE],
        propertyPath: 'startAt',
        message: 'heist.should_end_date.greater_than.start_date'
    )]
    private ?\DateTimeInterface $shouldEndAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups([self::READ])]
    #[Assert\Type(type: "\DateTimeInterface", groups: [], message: 'heist.end_date.invalid')]
    #[Assert\GreaterThan(
        groups: [],
        propertyPath: 'startAt',
        message: 'heist.end_date.greater_than.start_date'
    )]
    private ?\DateTimeInterface $endedAt = null;

    /** @var array<int, array<string, string|bool>> */
    #[ORM\Column(type: Types::JSON)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\Count(
        groups: [self::CREATE, self::UPDATE],
        max: 20,
        maxMessage: 'heist.objectives.size.invalid',
    )]
    private array $objectives = [];

    #[ORM\Column(length: 50, enumType: HeistPreferedTacticEnum::class)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private HeistPreferedTacticEnum $preferedTactic = HeistPreferedTacticEnum::Unknown;

    #[ORM\Column(length: 50, enumType: HeistDifficultyEnum::class)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private HeistDifficultyEnum $difficulty = HeistDifficultyEnum::Normal;

    #[ORM\Column(length: 50, enumType: HeistPhaseEnum::class)]
    #[Groups([self::READ])]
    private HeistPhaseEnum $phase = HeistPhaseEnum::Planning;

    #[ORM\Column(length: 10, enumType: HeistVisibilityEnum::class)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private HeistVisibilityEnum $visibility = HeistVisibilityEnum::Draft;

    /** @var ArrayCollection<int, CrewMember> */
    #[ORM\OneToMany(mappedBy: 'heist', targetEntity: CrewMember::class, orphanRemoval: true)]
    #[Groups([self::READ])]
    private Collection $crewMembers;

    #[ORM\ManyToOne(inversedBy: 'heists', targetEntity: Location::class)]
    #[Groups([self::READ])]
    private ?Location $location = null;

    /**
     * Used to get or create the location of the heist on create, not mapped.
     */
    #[Groups([self::CREATE])]
    #[Assert\NotBlank(groups: [self::CREATE], message: 'heist.place_id.not_blank')]
    private ?string $placeId = null;

    /** @var ArrayCollection<int, Employee> */
    #[ORM\ManyToMany(targetEntity: Employee::class, inversedBy: 'allowedHeists')]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private Collection $allowedEmployees;

    #[ORM\ManyToOne(inversedBy: 'heists', targetEntity: Employee::class)]
    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[Groups([self::READ, self::UPDATE, self::CHOOSE_EMPLOYEE])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(inversedBy: 'heists')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::CREATE])]
    #[Assert\NotBlank(groups: [self::CREATE], message: 'heist.establishment.not_blank')]
    private ?Establishment $establishment = null;

    /** @var ArrayCollection<int, Asset> */
    #[ORM\ManyToMany(targetEntity: Asset::class, inversedBy: 'forbiddenHeists')]
    #[ORM\JoinTable(name: 'heist_forbidden_assets')]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private Collection $forbiddenAssets;

    /** @var ArrayCollection<int, Asset> */
    #[ORM\OneToMany(mappedBy: 'heist', targetEntity: Asset::class, orphanRemoval: true)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private Collection $assets;

    /** @var ArrayCollection<int, User> */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'forbiddenHeists')]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private Collection $forbiddenUsers;

    public function __construct()
    {
        $this->crewMembers = new ArrayCollection();
        $this->allowedEmployees = new ArrayCollection();
        $this->forbiddenAssets = new ArrayCollection();
        $this->assets = new ArrayCollection();
        $this->forbiddenUsers = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getMinimumPayout(): ?float
    {
        return $this->minimumPayout;
    }

    public function setMinimumPayout(float $minimumPayout): static
    {
        $this->minimumPayout = $minimumPayout;

        return $this;
    }

    public function getMaximumPayout(): ?float
    {
        return $this->maximumPayout;
    }

    public function setMaximumPayout(float $maximumPayout): static
    {
        $this->maximumPayout = $maximumPayout;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

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

    public function getStartAt(): ?\DateTimeInterface
    {
        return $this->startAt;
    }

    public function setStartAt(?\DateTimeInterface $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getShouldEndAt(): ?\DateTimeInterface
    {
        return $this->shouldEndAt;
    }

    public function setShouldEndAt(?\DateTimeInterface $shouldEndAt): static
    {
        $this->shouldEndAt = $shouldEndAt;

        return $this;
    }

    public function getEndedAt(): ?\DateTimeInterface
    {
        return $this->endedAt;
    }

    public function setEndedAt(?\DateTimeInterface $endedAt): static
    {
        $this->endedAt = $endedAt;

        return $this;
    }

    /**
     * @return array<int, array<string, string|bool>>
     */
    public function getObjectives(): array
    {
        return $this->objectives;
    }

    /**
     * @return array<int, array<string, string|bool>>
     */
    public function getRequiredObjectives(): array
    {
        return array_filter(
            $this->objectives,
            static fn (array $objective): bool => !isset($objective['optional']) || !$objective['optional']
        );
    }

    public function getObjectiveCount(): int
    {
        return \count($this->objectives);
    }

    public function getRequiredObjectiveCount(): int
    {
        return \count($this->getRequiredObjectives());
    }

    public function getPlaceId(): ?string
    {
        return $this->placeId;
    }

    public function setPlaceId(?string $placeId): static
    {
        $this->placeId = $placeId;

        return $this;
    }

    /**
     * @param array<int, array<string, string|bool>> $objectives
     */
    public function setObjectives(array $objectives): static
    {
        $this->objectives = $objectives;

        return $this;
    }

    public function getPreferedTactic(): HeistPreferedTacticEnum
    {
        return $this->preferedTactic;
    }

    public function setPreferedTactic(HeistPreferedTacticEnum $preferedTactic): static
    {
        $this->preferedTactic = $preferedTactic;

        return $this;
    }

    public function getDifficulty(): HeistDifficultyEnum
    {
        return $this->difficulty;
    }

    public function setDifficulty(HeistDifficultyEnum $difficulty): static
    {
        $this->difficulty = $difficulty;

        return $this;
    }

    public function getPhase(): HeistPhaseEnum
    {
        return $this->phase;
    }

    public function setPhase(HeistPhaseEnum $phase): static
    {
        $this->phase = $phase;

        return $this;
    }

    public function getVisibility(): HeistVisibilityEnum
    {
        return $this->visibility;
    }

    public function setVisibility(HeistVisibilityEnum $visibility): static
    {
        $this->visibility = $visibility;

        return $this;
    }

    /**
     * @return Collection<int, CrewMember>
     */
    public function getCrewMembers(): Collection
    {
        return $this->crewMembers;
    }

    public function addCrewMember(CrewMember $crewMember): static
    {
        if (!$this->crewMembers->contains($crewMember)) {
            $this->crewMembers->add($crewMember);
            $crewMember->setHeist($this);
        }

        return $this;
    }

    public function removeCrewMember(CrewMember $crewMember): static
    {
        if ($this->crewMembers->removeElement($crewMember)) {
            // set the owning side to null (unless already changed)
            if ($crewMember->getHeist() === $this) {
                $crewMember->setHeist(null);
            }
        }

        return $this;
    }

    public function getLocation(): ?Location
    {
        return $this->location;
    }

    public function setLocation(?Location $location): static
    {
        $this->location = $location;

        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getAllowedEmployees(): Collection
    {
        return $this->allowedEmployees;
    }

    public function addAllowedEmployee(Employee $allowedEmployee): static
    {
        if (!$this->allowedEmployees->contains($allowedEmployee)) {
            $this->allowedEmployees->add($allowedEmployee);
        }

        return $this;
    }

    public function removeAllowedEmployee(Employee $allowedEmployee): static
    {
        $this->allowedEmployees->removeElement($allowedEmployee);

        return $this;
    }

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;

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

    /**
     * @return Collection<int, Asset>
     */
    public function getForbiddenAssets(): Collection
    {
        return $this->forbiddenAssets;
    }

    public function addForbiddenAsset(Asset $forbiddenAsset): static
    {
        if (!$this->forbiddenAssets->contains($forbiddenAsset)) {
            $this->forbiddenAssets->add($forbiddenAsset);
        }

        return $this;
    }

    public function removeForbiddenAsset(Asset $forbiddenAsset): static
    {
        $this->forbiddenAssets->removeElement($forbiddenAsset);

        return $this;
    }

    /**
     * @return Collection<int, Asset>
     */
    public function getAssets(): Collection
    {
        return $this->assets;
    }

    public function addAsset(Asset $asset): static
    {
        if (!$this->assets->contains($asset)) {
            $this->assets->add($asset);
            $asset->setHeist($this);
        }

        return $this;
    }

    public function removeAsset(Asset $asset): static
    {
        if ($this->assets->removeElement($asset)) {
            // set the owning side to null (unless already changed)
            if ($asset->getHeist() === $this) {
                $asset->setHeist(null);
            }
        }

        return $this;
    }

    /**
     * @return ArrayCollection<int, Asset>
     */
    public function getHeistAssets(): Collection
    {
        return array_reduce(
            $this->crewMembers->toArray(),
            static fn (Collection $carry, CrewMember $crewMember): Collection => new ArrayCollection([
                ...$carry->toArray(),
                ...$crewMember->getHeistAssets()->toArray(),
            ]),
            new ArrayCollection()
        );
    }

    /**
     * @return Collection<int, User>
     */
    public function getForbiddenUsers(): Collection
    {
        return $this->forbiddenUsers;
    }

    public function addForbiddenUser(User $forbiddenUser): static
    {
        if (!$this->forbiddenUsers->contains($forbiddenUser)) {
            $this->forbiddenUsers->add($forbiddenUser);
        }

        return $this;
    }

    public function removeForbiddenUser(User $forbiddenUser): static
    {
        $this->forbiddenUsers->removeElement($forbiddenUser);

        return $this;
    }
}
