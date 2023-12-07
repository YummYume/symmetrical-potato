<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\CrewMemberStatusEnum;
use App\Repository\CrewMemberRepository;
use App\State\CrewMemberProcessor;
use App\Validator\CanJoin;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CrewMemberRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    processor: CrewMemberProcessor::class,
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC],
            ]
        ),
        new Mutation(
            name: 'create',
            securityPostDenormalize: '
                is_granted("ROLE_HEISTER") and
                "planning" === object.getHeist().getPhase().value
            ',
            normalizationContext: [
                'groups' => [self::READ],
            ],
            denormalizationContext: [
                'groups' => [self::JOIN],
            ],
            validationContext: [
                'groups' => [self::JOIN],
            ]
        ),
        new Mutation(name: 'update'),
        new DeleteMutation(
            name: 'delete',
            security: '
                (is_granted("ROLE_HEISTER") and user === object.getUser() and "planning" === object.getHeist().getPhase().value) or 
                is_granted("ROLE_ADMIN")
            '
        ),
    ]
)]
#[CanJoin(groups: [self::JOIN])]
class CrewMember
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'crew_member:read';
    public const READ_PUBLIC = 'crew_member:read:public';
    public const JOIN = 'crew_member:join';

    public const REVIVE_COST = 5_000_000;
    public const MAX_RATING = 5;
    public const KILL_RATIO_FACTOR = 0.01;
    public const CIVILIAN_CASUALTIES_RATIO_FACTOR = 0.15;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    #[Groups([self::READ])]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[Groups([self::READ])]
    private int $civilianCasualties = 0;

    #[ORM\Column]
    #[Groups([self::READ])]
    private int $kills = 0;

    #[ORM\Column]
    #[Groups([self::READ])]
    private int $objectivesCompleted = 0;

    #[ORM\Column(nullable: true)]
    #[Groups([self::READ])]
    private ?float $payout = null;

    #[ORM\Column(length: 50, enumType: CrewMemberStatusEnum::class)]
    #[Groups([self::READ])]
    private CrewMemberStatusEnum $status = CrewMemberStatusEnum::Free;

    #[ORM\ManyToOne(inversedBy: 'crewMembers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'crewMembers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::JOIN])]
    private ?Heist $heist = null;

    /** @var ArrayCollection<int, HeistAsset> */
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

    public function getCivilianCasualties(): int
    {
        return $this->civilianCasualties;
    }

    public function setCivilianCasualties(int $civilianCasualties): static
    {
        $this->civilianCasualties = $civilianCasualties;

        return $this;
    }

    public function getKills(): int
    {
        return $this->kills;
    }

    public function setKills(int $kills): static
    {
        $this->kills = $kills;

        return $this;
    }

    public function getObjectivesCompleted(): int
    {
        return $this->objectivesCompleted;
    }

    public function setObjectivesCompleted(int $objectivesCompleted): static
    {
        $this->objectivesCompleted = $objectivesCompleted;

        return $this;
    }

    /**
     * Will calculate the rating of the crew member for the heist depending on multiple factors.
     * We first calculate the score for the objectives (based on the number of required objectives).
     * Then we add the score for the number of kills, but we limit it to 1.
     * Finally, we remove the score for the number of civilian casualties, up to a maximum of 4.
     * Civilian casualties are way more penalizing than the rewards for kills.
     *
     * @return float between 0 and CrewMember::MAX_RATING (5)
     */
    public function getRating(): float
    {
        $totalObjectives = $this->heist->getObjectiveCount() < 1 ? Heist::MAX_OBJECTIVES_PER_HEIST : $this->heist->getRequiredObjectiveCount();
        $objectivesScore = (self::MAX_RATING * $this->objectivesCompleted) / $totalObjectives;
        $killsScore = min($this->kills * self::KILL_RATIO_FACTOR, 1);
        $civilianCasualtiesPenalty = min($this->civilianCasualties * self::CIVILIAN_CASUALTIES_RATIO_FACTOR, 4);
        $rating = round($objectivesScore + $killsScore - $civilianCasualtiesPenalty, 2);

        return max(0, min(self::MAX_RATING, $rating));
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
