<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Repository\LocationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: LocationRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => ['location:read:public'],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => ['location:read:public'],
            ]
        ),
    ]
)]
class Location
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['location:read'])]
    private ?float $latitude = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['location:read'])]
    private ?float $longitude = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    #[Groups(['location:read', 'location:read:public'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    #[Groups(['location:read'])]
    private ?string $address = null;

    #[ORM\Column]
    private int $reviewCount = 0;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    private ?float $averageRating = null;

    /** @var ArrayCollection<int, Review> */
    #[ORM\OneToMany(mappedBy: 'location', targetEntity: Review::class)]
    private Collection $reviews;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\OneToMany(mappedBy: 'location', targetEntity: Heist::class)]
    private Collection $heist;

    public function __construct()
    {
        $this->reviews = new ArrayCollection();
        $this->heist = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(float $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(float $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
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
            $review->setLocation($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            // set the owning side to null (unless already changed)
            if ($review->getLocation() === $this) {
                $review->setLocation(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Heist>
     */
    public function getHeist(): Collection
    {
        return $this->heist;
    }

    public function addHeist(Heist $heist): static
    {
        if (!$this->heist->contains($heist)) {
            $this->heist->add($heist);
            $heist->setLocation($this);
        }

        return $this;
    }

    public function removeHeist(Heist $heist): static
    {
        if ($this->heist->removeElement($heist)) {
            // set the owning side to null (unless already changed)
            if ($heist->getLocation() === $this) {
                $heist->setLocation(null);
            }
        }

        return $this;
    }
}
