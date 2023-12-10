<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
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
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LocationRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ],
            ]
        ),
    ]
)]
#[UniqueEntity(
    fields: ['latitude', 'longitude'],
    message: 'location.latlng.unique',
    groups: [self::WRITE]
)]
#[UniqueEntity(
    fields: ['name'],
    message: 'location.name.unique',
    groups: [self::WRITE]
)]
#[UniqueEntity(
    fields: ['address'],
    message: 'location.address.unique',
    groups: [self::WRITE]
)]
#[ApiFilter(SearchFilter::class, properties: ['placeId' => 'exact'])]
class Location
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'location:read';
    public const WRITE = 'location:write';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: false)]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[Groups([self::READ, Heist::READ])]
    #[Assert\NotBlank(groups: [self::WRITE], message: 'location.latitude.not_blank')]
    #[Assert\Type(type: 'float', groups: [self::WRITE], message: 'location.latitude.type')]
    private ?float $latitude = null;

    #[ORM\Column]
    #[Groups([self::READ, Heist::READ])]
    #[Assert\NotBlank(groups: [self::WRITE], message: 'location.longitude.not_blank')]
    #[Assert\Type(type: 'float', groups: [self::WRITE], message: 'location.longitude.type')]
    private ?float $longitude = null;

    #[ORM\Column(length: 255)]
    #[Groups([self::READ, Heist::READ])]
    #[Assert\NotBlank(groups: [self::WRITE], message: 'location.name.not_blank')]
    #[Assert\Length(max: 255, groups: [self::WRITE], maxMessage: 'location.name.max_length')]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([self::READ, Heist::READ])]
    #[Assert\Length(max: 255, groups: [self::WRITE], maxMessage: 'location.address.max_length')]
    private ?string $address = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups([self::READ, Heist::READ])]
    #[Assert\Length(max: 255, groups: [self::WRITE], maxMessage: 'location.place_id.max_length')]
    #[ApiProperty(identifier: true)]
    private ?string $placeId = null;

    #[ORM\Column]
    #[Groups([self::READ, Heist::READ])]
    private int $reviewCount = 0;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups([self::READ, Heist::READ])]
    private ?float $averageRating = null;

    /** @var ArrayCollection<int, Review> */
    #[ORM\OneToMany(mappedBy: 'location', targetEntity: Review::class)]
    private Collection $reviews;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\OneToMany(mappedBy: 'location', targetEntity: Heist::class)]
    private Collection $heists;

    public function __construct()
    {
        $this->reviews = new ArrayCollection();
        $this->heists = new ArrayCollection();
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

    public function getPlaceId(): ?string
    {
        return $this->placeId;
    }

    public function setPlaceId(?string $placeId): static
    {
        $this->placeId = $placeId;

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
    public function getHeists(): Collection
    {
        return $this->heists;
    }

    public function addHeist(Heist $heist): static
    {
        if (!$this->heists->contains($heist)) {
            $this->heists->add($heist);
            $heist->setLocation($this);
        }

        return $this;
    }

    public function removeHeist(Heist $heist): static
    {
        if ($this->heists->removeElement($heist)) {
            // set the owning side to null (unless already changed)
            if ($heist->getLocation() === $this) {
                $heist->setLocation(null);
            }
        }

        return $this;
    }
}
