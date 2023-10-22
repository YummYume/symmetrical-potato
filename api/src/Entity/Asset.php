<?php

namespace App\Entity;

use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\AssetTypeEnum;
use App\Repository\AssetRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: AssetRepository::class)]
class Asset
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(length: 50, enumType: AssetTypeEnum::class)]
    private AssetTypeEnum $type = AssetTypeEnum::Asset;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?int $maxQuantity = null;

    #[ORM\Column]
    private bool $teamAsset = true;

    #[ORM\ManyToOne(inversedBy: 'assets')]
    private ?Heist $heist = null;

    #[ORM\OneToMany(mappedBy: 'asset', targetEntity: HeistAsset::class, orphanRemoval: true)]
    private Collection $heistAssets;

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
