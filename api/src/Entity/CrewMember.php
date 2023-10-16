<?php

namespace App\Entity;

use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\CrewMemberStatusEnum;
use App\Repository\CrewMemberRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CrewMemberRepository::class)]
class CrewMember
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column]
    private ?int $civilianCasualties = null;

    #[ORM\Column]
    private ?int $kills = null;

    #[ORM\Column]
    private ?int $objectivesCompleted = null;

    #[ORM\Column]
    private ?float $payout = null;

    #[ORM\Column(length: 50, enumType: CrewMemberStatusEnum::class)]
    private CrewMemberStatusEnum $status = CrewMemberStatusEnum::Free;

    #[ORM\ManyToOne(inversedBy: 'crewMembers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'crewMembers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Heist $heist = null;

    #[ORM\OneToMany(mappedBy: 'crewMember', targetEntity: HeistAsset::class, orphanRemoval: true)]
    private Collection $heistAssets;

    public function __construct()
    {
        $this->heistAssets = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getCivilianCasualties(): ?int
    {
        return $this->civilianCasualties;
    }

    public function setCivilianCasualties(int $civilianCasualties): static
    {
        $this->civilianCasualties = $civilianCasualties;

        return $this;
    }

    public function getKills(): ?int
    {
        return $this->kills;
    }

    public function setKills(int $kills): static
    {
        $this->kills = $kills;

        return $this;
    }

    public function getObjectivesCompleted(): ?int
    {
        return $this->objectivesCompleted;
    }

    public function setObjectivesCompleted(int $objectivesCompleted): static
    {
        $this->objectivesCompleted = $objectivesCompleted;

        return $this;
    }

    // TODO: Return some rating based on the crew member's stats (kills, civilian casualties and objectives completed)
    public function getRating(): float
    {
        return 0.0;
    }

    public function getPayout(): ?float
    {
        return $this->payout;
    }

    public function setPayout(float $payout): static
    {
        $this->payout = $payout;

        return $this;
    }

    public function getStatus(): CrewMemberStatusEnum
    {
        return $this->status;
    }

    public function setStatus(CrewMemberStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getHeist(): ?Heist
    {
        return $this->heist;
    }

    public function setHeist(?Heist $heist): static
    {
        $this->heist = $heist;

        return $this;
    }

    /**
     * @return Collection<int, HeistAsset>
     */
    public function getHeistAssets(): Collection
    {
        return $this->heistAssets;
    }

    public function addHeistAsset(HeistAsset $heistAsset): static
    {
        if (!$this->heistAssets->contains($heistAsset)) {
            $this->heistAssets->add($heistAsset);
            $heistAsset->setCrewMember($this);
        }

        return $this;
    }

    public function removeHeistAsset(HeistAsset $heistAsset): static
    {
        if ($this->heistAssets->removeElement($heistAsset)) {
            // set the owning side to null (unless already changed)
            if ($heistAsset->getCrewMember() === $this) {
                $heistAsset->setCrewMember(null);
            }
        }

        return $this;
    }
}
