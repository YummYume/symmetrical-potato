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
                'groups' => [Location::READ, Location::READ_PUBLIC],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [Location::READ, Location::READ_PUBLIC],
            ]
        ),
    ]
)]
#[UniqueEntity(
    fields: ['latitude', 'longitude'],
    message: 'location.latlng.unique',
    groups: [Location::CREATE]
)]
#[UniqueEntity(
    fields: ['name'],
    message: 'location.name.unique',
    groups: [Location::CREATE]
)]
#[UniqueEntity(
    fields: ['address'],
    message: 'location.address.unique',
    groups: [Location::CREATE]
)]
class Location
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'location:read';
    public const READ_PUBLIC = 'location:read:public';
    public const CREATE = 'location:create';
    public const CREATE_PUBLIC = 'location:create:public';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    #[Assert\NotBlank(groups: [self::CREATE], message: 'location.latitude.not_blank')]
    #[Assert\Type(type: 'float', groups: [self::CREATE], message: 'location.latitude.type')]
    private ?float $latitude = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups([self::READ])]
    #[Assert\NotBlank(groups: [self::CREATE], message: 'location.longitude.not_blank')]
    #[Assert\Type(type: 'float', groups: [self::CREATE], message: 'location.longitude.type')]
    private ?float $longitude = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    #[Groups([self::READ, self::READ_PUBLIC])]
    #[Assert\NotBlank(groups: [self::CREATE], message: 'location.name.not_blank')]
    #[Assert\Length(max: 255, groups: [self::CREATE], maxMessage: 'location.name.max_length')]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    #[Groups([self::READ])]
    #[Assert\Length(max: 255, groups: [self::CREATE], maxMessage: 'location.address.max_length')]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[ApiProperty]
    #[Groups([self::READ])]
    #[Assert\Length(max: 255, groups: [self::CREATE], maxMessage: 'location.place_id.max_length')]
    private ?string $placeId = null;

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
