<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Repository\HeistAssetRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: HeistAssetRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    graphQlOperations: [
        new Query(),
        new QueryCollection(),
        new Mutation(name: 'create'),
        new Mutation(name: 'update'),
        new DeleteMutation(name: 'delete'),
    ]
)]
class HeistAsset
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column]
    private ?int $quantity = 1;

    #[ORM\Column]
    private float $totalSpent = 0.0;

    #[ORM\ManyToOne(inversedBy: 'heistAssets')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Asset $asset = null;

    #[ORM\ManyToOne(inversedBy: 'heistAssets')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CrewMember $crewMember = null;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(?int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getTotalSpent(): float
    {
        return $this->totalSpent;
    }

    public function setTotalSpent(float $totalSpent): static
    {
        $this->totalSpent = $totalSpent;

        return $this;
    }

    public function getAsset(): ?Asset
    {
        return $this->asset;
    }

    public function setAsset(?Asset $asset): static
    {
        $this->asset = $asset;

        return $this;
    }

    public function getCrewMember(): ?CrewMember
    {
        return $this->crewMember;
    }

    public function setCrewMember(?CrewMember $crewMember): static
    {
        $this->crewMember = $crewMember;

        return $this;
    }
}
