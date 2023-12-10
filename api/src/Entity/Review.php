<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\ReviewRatingEnum;
use App\Repository\ReviewRepository;
use App\State\ReviewProcessor;
use App\Validator\CanReview;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: ReviewProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ]
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ]
        ),
        new Mutation(
            name: 'create',
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::CREATE],
            ],
            validationContext: [
                'groups' => [self::CREATE],
            ]
        ),
        new Mutation(
            name: 'update',
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::TIMESTAMPABLE],
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
#[ApiFilter(SearchFilter::class, properties: ['location.placeId' => 'exact'])]
#[UniqueEntity(
    fields: ['user', 'establishment'],
    errorPath: 'establishment',
    message: 'review.establishment.unique',
    groups: [self::CREATE]
)]
#[UniqueEntity(
    fields: ['user', 'location'],
    errorPath: 'location',
    message: 'review.location.unique',
    groups: [self::CREATE]
)]
#[Assert\Expression(
    expression: '
        (this.getEstablishment() != null and this.getLocation() == null) or
        (this.getEstablishment() == null and this.getLocation() != null)
    ',
    message: 'review.establishment_or_location',
    groups: [self::CREATE]
)]
class Review
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ_PUBLIC = 'review:read:public';
    public const CREATE = 'review:create';
    public const UPDATE = 'review:update';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    #[Groups([self::READ_PUBLIC])]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\Length(max: 1000, maxMessage: 'review.comment.max_length', groups: [self::CREATE, self::UPDATE])]
    private ?string $comment = null;

    #[ORM\Column(length: 20, enumType: ReviewRatingEnum::class)]
    #[Groups([self::READ_PUBLIC, self::CREATE, self::UPDATE])]
    #[Assert\NotBlank(message: 'review.rating.not_blank', groups: [self::CREATE, self::UPDATE])]
    private ?ReviewRatingEnum $rating = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ_PUBLIC])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[Groups([self::READ_PUBLIC, self::CREATE])]
    #[CanReview(message: 'review.establishment.cannot_review', groups: [self::CREATE])]
    private ?Establishment $establishment = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[Groups([self::READ_PUBLIC, self::CREATE])]
    #[CanReview(message: 'review.location.cannot_review', groups: [self::CREATE])]
    private ?Location $location = null;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getRating(): ?ReviewRatingEnum
    {
        return $this->rating;
    }

    public function setRating(?ReviewRatingEnum $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    #[Groups([self::READ_PUBLIC])]
    public function getRatingNumber(): ?float
    {
        return $this->rating ? ReviewRatingEnum::getRatingValue($this->rating) : null;
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

    public function getEstablishment(): ?Establishment
    {
        return $this->establishment;
    }

    public function setEstablishment(?Establishment $establishment): static
    {
        $this->establishment = $establishment;

        return $this;
    }

    public function getLocation(): ?Location
    {
        return $this->location;
    }

    public function setLocation(?Location $location): static
    {
        $this->location = $location;

        return $this;
    }
}
