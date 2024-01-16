<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\AssetTypeEnum;
use App\Repository\AssetRepository;
use App\State\AssetProcessor;
use App\Validator\CanAddHeistAsset;
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

#[ORM\Entity(repositoryClass: AssetRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    processor: AssetProcessor::class,
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ, self::TIMESTAMPABLE, self::BLAMEABLE],
            ]
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
            securityPostDenormalize: 'is_granted("UPDATE", object)'
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)'
        ),
    ]
)]
#[UniqueEntity(
    fields: ['name', 'heist'],
    errorPath: 'name',
    message: 'asset.name.unique',
    groups: [self::CREATE, self::UPDATE],
    ignoreNull: false
)]
class Asset
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'asset:read';
    public const CREATE = 'asset:create';
    public const UPDATE = 'asset:update';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'asset.name.not_blank')]
    #[Assert\Length(
        min: 3,
        max: 150,
        groups: [self::CREATE, self::UPDATE],
        minMessage: 'asset.name.min_length',
        maxMessage: 'asset.name.max_length'
    )]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'asset.price.not_blank')]
    #[Assert\Positive(groups: [self::CREATE, self::UPDATE], message: 'asset.price.positive')]
    private ?float $price = null;

    #[ORM\Column(length: 50, enumType: AssetTypeEnum::class)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private AssetTypeEnum $type = AssetTypeEnum::Asset;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\Length(max: 1000, maxMessage: 'asset.description.max_length', groups: [self::CREATE, self::UPDATE])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(groups: [self::CREATE, self::UPDATE], message: 'asset.max_quantity.not_blank')]
    #[Assert\Positive(groups: [self::CREATE, self::UPDATE], message: 'asset.max_quantity.positive')]
    #[Assert\LessThanOrEqual(
        value: 100,
        groups: [self::CREATE, self::UPDATE],
        message: 'asset.max_quantity.max'
    )]
    private ?int $maxQuantity = null;

    #[ORM\Column]
    #[Groups([self::READ, self::CREATE, self::UPDATE])]
    private bool $teamAsset = true;

    #[ORM\ManyToOne(inversedBy: 'assets')]
    #[Groups([self::READ, self::CREATE])]
    #[CanAddHeistAsset(groups: [self::CREATE])]
    private ?Heist $heist = null;

    /** @var ArrayCollection<int, HeistAsset> */
    #[ORM\OneToMany(mappedBy: 'asset', targetEntity: HeistAsset::class, orphanRemoval: true)]
    private Collection $heistAssets;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\ManyToMany(targetEntity: Heist::class, mappedBy: 'forbiddenAssets')]
    private Collection $forbiddenHeists;

    public function __construct()
    {
        $this->heistAssets = new ArrayCollection();
        $this->forbiddenHeists = new ArrayCollection();
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

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getType(): AssetTypeEnum
    {
        return $this->type;
    }

    public function setType(AssetTypeEnum $type): static
    {
        $this->type = $type;

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

    public function getMaxQuantity(): ?int
    {
        return $this->maxQuantity;
    }

    public function setMaxQuantity(int $maxQuantity): static
    {
        $this->maxQuantity = $maxQuantity;

        return $this;
    }

    public function isTeamAsset(): bool
    {
        return $this->teamAsset;
    }

    public function setTeamAsset(bool $teamAsset): static
    {
        $this->teamAsset = $teamAsset;

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

    public function isGlobalAsset(): bool
    {
        return null === $this->heist;
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
            $heistAsset->setAsset($this);
        }

        return $this;
    }

    public function removeHeistAsset(HeistAsset $heistAsset): static
    {
        if ($this->heistAssets->removeElement($heistAsset)) {
            // set the owning side to null (unless already changed)
            if ($heistAsset->getAsset() === $this) {
                $heistAsset->setAsset(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Heist>
     */
    public function getForbiddenHeists(): Collection
    {
        return $this->forbiddenHeists;
    }

    public function addForbiddenHeist(Heist $forbiddenHeist): static
    {
        if (!$this->forbiddenHeists->contains($forbiddenHeist)) {
            $this->forbiddenHeists->add($forbiddenHeist);
            $forbiddenHeist->addForbiddenAsset($this);
        }

        return $this;
    }

    public function removeForbiddenHeist(Heist $forbiddenHeist): static
    {
        if ($this->forbiddenHeists->removeElement($forbiddenHeist)) {
            $forbiddenHeist->removeForbiddenAsset($this);
        }

        return $this;
    }
}
