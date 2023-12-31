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
use App\Filter\UuidFilter;
use App\Repository\EstablishmentRepository;
use App\State\EstablishmentProcessor;
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

#[ORM\Entity(repositoryClass: EstablishmentRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: EstablishmentProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("READ", object)'
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ]
        ),
        new Mutation(
            name: 'create',
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
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
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::UPDATE],
            ],
            validationContext: [
                'groups' => [self::UPDATE],
            ],
            security: 'is_granted("UPDATE", object)'
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)'
        ),
    ]
)]
#[ApiFilter(UuidFilter::class, properties: ['contractor.id'])]
#[Assert\Expression(
    expression: 'this.getContractor()?.getEstablishments().count() < 10',
    message: 'establishment.contractor.not_more_than_ten',
    groups: [self::CREATE]
)]
#[Assert\Expression(
    expression: 'this.getContractorCut() + this.getEmployeeCut() + this.getCrewCut() == 100',
    message: 'establishment.cuts.sum_to_100',
    groups: [self::CREATE, self::UPDATE]
)]
#[UniqueEntity(
    fields: ['name'],
    message: 'establishment.name.unique',
    groups: [self::CREATE]
)]
class Establishment
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'establishment:read';
    public const READ_PUBLIC = 'establishment:read:public';
    public const CREATE = 'establishment:create';
    public const UPDATE = 'establishment:update';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    #[Groups([self::READ_PUBLIC, self::CREATE])]
    #[Assert\NotBlank(message: 'establishment.name.not_blank', groups: [self::CREATE])]
    #[Assert\Length(
        min: 1,
        max: 150,
        minMessage: 'establishment.name.min_length',
        maxMessage: 'establishment.name.max_length',
        groups: [self::CREATE]
    )]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\Length(max: 5000, maxMessage: 'establishment.description.max_length', groups: [self::CREATE, self::UPDATE])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'establishment.minimum_wage.not_blank', groups: [self::CREATE, self::UPDATE])]
    #[Assert\Positive(
        message: 'establishment.minimum_wage.positive',
        groups: [self::CREATE, self::UPDATE]
    )]
    #[Assert\GreaterThanOrEqual(
        value: 1000,
        message: 'establishment.minimum_wage.greater_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    private ?float $minimumWage = null;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'establishment.minimum_work_time_per_week.not_blank', groups: [self::CREATE, self::UPDATE])]
    #[Assert\GreaterThanOrEqual(
        value: 1,
        message: 'establishment.minimum_work_time_per_week.greater_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    #[Assert\LessThanOrEqual(
        value: 84,
        message: 'establishment.minimum_work_time_per_week.less_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    private ?int $minimumWorkTimePerWeek = null;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'establishment.contractor_cut.not_blank', groups: [self::CREATE, self::UPDATE])]
    #[Assert\GreaterThanOrEqual(
        value: 1,
        message: 'establishment.contractor_cut.greater_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    #[Assert\LessThan(
        value: 100,
        message: 'establishment.contractor_cut.less_than',
        groups: [self::CREATE, self::UPDATE]
    )]
    private float $contractorCut = 15.0;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'establishment.employee_cut.not_blank', groups: [self::CREATE, self::UPDATE])]
    #[Assert\GreaterThanOrEqual(
        value: 1,
        message: 'establishment.employee_cut.greater_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    #[Assert\LessThan(
        value: 100,
        message: 'establishment.employee_cut.less_than',
        groups: [self::CREATE, self::UPDATE]
    )]
    private float $employeeCut = 05.0;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'establishment.crew_cut.not_blank', groups: [self::CREATE, self::UPDATE])]
    #[Assert\GreaterThanOrEqual(
        value: 20,
        message: 'establishment.crew_cut.greater_than_or_equal',
        groups: [self::CREATE, self::UPDATE]
    )]
    #[Assert\LessThan(
        value: 100,
        message: 'establishment.crew_cut.less_than',
        groups: [self::CREATE, self::UPDATE]
    )]
    private float $crewCut = 80.0;

    #[ORM\Column]
    #[Groups([self::READ_PUBLIC])]
    private int $reviewCount = 0;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups([self::READ_PUBLIC])]
    private ?float $averageRating = null;

    #[ORM\ManyToOne(inversedBy: 'establishments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ_PUBLIC, Heist::READ])]
    private ?User $contractor = null;

    /** @var ArrayCollection<int, Employee> */
    #[ORM\OneToMany(mappedBy: 'establishment', targetEntity: Employee::class, orphanRemoval: true)]
    private Collection $employees;

    /** @var ArrayCollection<int, Review> */
    #[ORM\OneToMany(mappedBy: 'establishment', targetEntity: Review::class, orphanRemoval: true)]
    private Collection $reviews;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\OneToMany(mappedBy: 'establishment', targetEntity: Heist::class, orphanRemoval: true)]
    private Collection $heists;

    public function __construct()
    {
        $this->employees = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->heists = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
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

    public function getMinimumWage(): ?float
    {
        return $this->minimumWage;
    }

    public function setMinimumWage(float $minimumWage): static
    {
        $this->minimumWage = $minimumWage;

        return $this;
    }

    public function getMinimumWorkTimePerWeek(): ?int
    {
        return $this->minimumWorkTimePerWeek;
    }

    public function setMinimumWorkTimePerWeek(?int $minimumWorkTimePerWeek): static
    {
        $this->minimumWorkTimePerWeek = $minimumWorkTimePerWeek;

        return $this;
    }

    public function getContractorCut(): float
    {
        return $this->contractorCut;
    }

    public function setContractorCut(float $contractorCut): static
    {
        $this->contractorCut = $contractorCut;

        return $this;
    }

    public function getEmployeeCut(): float
    {
        return $this->employeeCut;
    }

    public function setEmployeeCut(float $employeeCut): static
    {
        $this->employeeCut = $employeeCut;

        return $this;
    }

    public function getCrewCut(): float
    {
        return $this->crewCut;
    }

    public function setCrewCut(float $crewCut): static
    {
        $this->crewCut = $crewCut;

        return $this;
    }

    public function getHeisterCut(): float
    {
        return $this->getCrewCut() / Heist::MAX_ALLOWED_CREW_MEMBERS;
    }

    public function getReviewCount(): int
    {
        return $this->reviewCount;
    }

    public function setReviewCount(int $reviewCount): static
    {
        $this->reviewCount = $reviewCount;

        return $this;
    }

    public function getAverageRating(): ?float
    {
        return $this->averageRating;
    }

    public function setAverageRating(?float $averageRating): static
    {
        $this->averageRating = $averageRating;

        return $this;
    }

    public function getContractor(): ?User
    {
        return $this->contractor;
    }

    public function setContractor(?User $contractor): static
    {
        $this->contractor = $contractor;

        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    public function addEmployee(Employee $employee): static
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->setEstablishment($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee)) {
            // set the owning side to null (unless already changed)
            if ($employee->getEstablishment() === $this) {
                $employee->setEstablishment(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }

    public function addReview(Review $review): static
    {
        if (!$this->reviews->contains($review)) {
            $this->reviews->add($review);
            $review->setEstablishment($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            // set the owning side to null (unless already changed)
            if ($review->getEstablishment() === $this) {
                $review->setEstablishment(null);
            }
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
            $heist->setEstablishment($this);
        }

        return $this;
    }

    public function removeHeist(Heist $heist): static
    {
        if ($this->heists->removeElement($heist)) {
            // set the owning side to null (unless already changed)
            if ($heist->getEstablishment() === $this) {
                $heist->setEstablishment(null);
            }
        }

        return $this;
    }
}
