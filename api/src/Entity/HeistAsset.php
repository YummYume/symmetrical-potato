<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Filter\UuidFilter;
use App\Repository\HeistAssetRepository;
use App\State\HeistAssetProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: HeistAssetRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: HeistAssetProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ, self::TIMESTAMPABLE, self::BLAMEABLE],
            ],
            security: 'is_granted("READ", object)'
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ, self::TIMESTAMPABLE, self::BLAMEABLE],
            ]
        ),
        new Mutation(
            name: 'create',
            normalizationContext: [
                'groups' => [self::READ, self::TIMESTAMPABLE, self::BLAMEABLE],
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
                'groups' => [self::READ, self::TIMESTAMPABLE, self::BLAMEABLE],
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
#[UniqueEntity(
    fields: ['asset', 'crewMember'],
    message: 'heist_asset.asset_crew_member.unique',
    groups: [self::CREATE]
)]
#[ApiFilter(UuidFilter::class, properties: ['crewMember.id'])]
class HeistAsset
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'heist_asset:read';
    public const READ_PUBLIC = 'heist_asset:read:public';
    public const CREATE = 'heist_asset:create';
    public const UPDATE = 'heist_asset:update';
    public const DELETE = 'heist_asset:delete';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\GreaterThanOrEqual(
        groups: [self::CREATE, self::UPDATE],
        value: 1,
        message: 'heist_asset.quantity.greater_than_or_equal_to'
    )]
    private ?int $quantity = 1;

    #[ORM\Column]
    #[Groups([self::READ])]
    #[Assert\GreaterThanOrEqual(
        groups: [self::CREATE, self::UPDATE],
        value: 0,
        message: 'heist_asset.total_spent.greater_than_or_equal_to'
    )]
    private float $totalSpent = 0.0;

    #[ORM\ManyToOne(inversedBy: 'heistAssets')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::CREATE])]
    private ?Asset $asset = null;

    #[ORM\ManyToOne(inversedBy: 'heistAssets')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::CREATE])]
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
