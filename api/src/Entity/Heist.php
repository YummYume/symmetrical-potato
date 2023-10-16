<?php

namespace App\Entity;

use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistPreferedTacticEnum;
use App\Repository\HeistRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: HeistRepository::class)]
class Heist
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column]
    private ?float $minimumPayout = null;

    #[ORM\Column]
    private ?float $maximumPayout = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 50, enumType: HeistPreferedTacticEnum::class)]
    private HeistPreferedTacticEnum $preferedTactic = HeistPreferedTacticEnum::Unknown;

    #[ORM\Column(length: 50, enumType: HeistDifficultyEnum::class)]
    private HeistDifficultyEnum $difficulty = HeistDifficultyEnum::Normal;

    #[ORM\Column(length: 50, enumType: HeistStatusEnum::class)]
    private HeistPhaseEnum $phase = HeistPhaseEnum::Planning;

    #[ORM\OneToMany(mappedBy: 'heist', targetEntity: CrewMember::class, orphanRemoval: true)]
    private Collection $crewMembers;

    #[ORM\ManyToOne(inversedBy: 'heist')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Location $location = null;

    #[ORM\ManyToMany(targetEntity: Employee::class, inversedBy: 'allowedHeists')]
    private Collection $allowedEmployees;

    #[ORM\ManyToOne(inversedBy: 'heists')]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(inversedBy: 'heists')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Establishment $establishment = null;

    #[ORM\ManyToMany(targetEntity: Asset::class, inversedBy: 'forbiddenHeists')]
    #[ORM\JoinTable(name: 'heist_forbidden_assets')]
    private Collection $forbiddenAssets;

    #[ORM\OneToMany(mappedBy: 'heist', targetEntity: Asset::class)]
    private Collection $assets;

    public function __construct()
    {
        $this->crewMembers = new ArrayCollection();
        $this->allowedEmployees = new ArrayCollection();
        $this->forbiddenAssets = new ArrayCollection();
        $this->assets = new ArrayCollection();
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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
}
