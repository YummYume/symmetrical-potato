<?php

namespace App\Entity;

use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
class Employee
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::JSON)]
    private array $weeklySchedule = [];

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $codeName = null;

    #[ORM\OneToOne(mappedBy: 'employee', cascade: ['persist', 'remove'])]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'employee', targetEntity: EmployeeTimeOff::class, orphanRemoval: true)]
    private Collection $timeOffs;

    #[ORM\ManyToOne(inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Establishment $establishment = null;

    #[ORM\Column(length: 50, enumType: EmployeeStatusEnum::class)]
    private EmployeeStatusEnum $status = EmployeeStatusEnum::Pending;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motivation = null;

    #[ORM\ManyToMany(targetEntity: Heist::class, mappedBy: 'allowedEmployees')]
    private Collection $allowedHeists;

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

    public function getWeeklySchedule(): array
    {
        return $this->weeklySchedule;
    }

    public function setWeeklySchedule(array $weeklySchedule): static
    {
        $this->weeklySchedule = $weeklySchedule;

        return $this;
    }

    public function getCodeName(): ?string
    {
        return $this->codeName;
    }

    public function setCodeName(string $codeName): static
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
}
