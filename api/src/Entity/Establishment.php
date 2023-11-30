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
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: EstablishmentRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [Establishment::READ_PUBLIC],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [Establishment::READ_PUBLIC],
            ]
        ),
        new Mutation(name: 'create'),
        new Mutation(name: 'update'),
        new DeleteMutation(name: 'delete'),
    ]
)]
#[ApiFilter(UuidFilter::class, properties: ['contractor.id'])]
class Establishment
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'establishment:read';
    public const READ_PUBLIC = 'establishment:read:public';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    #[Groups([self::READ])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    #[ApiProperty]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[ApiProperty]
    #[Groups([self::READ])]
    private ?string $description = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    private ?float $minimumWage = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    private ?int $minimumWorkTimePerWeek = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    private float $contractorCut = 15.0;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    private float $employeeCut = 05.0;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    private float $crewCut = 80.0;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private int $reviewCount = 0;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[ApiProperty]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private ?float $averageRating = null;

    #[ORM\ManyToOne(inversedBy: 'establishments')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty]
    #[Groups([self::READ])]
    private ?User $contractor = null;

    /** @var ArrayCollection<int, Employee> */
    #[ORM\OneToMany(mappedBy: 'establishment', targetEntity: Employee::class)]
    private Collection $employees;

    /** @var ArrayCollection<int, Review> */
    #[ORM\OneToMany(mappedBy: 'establishment', targetEntity: Review::class)]
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
