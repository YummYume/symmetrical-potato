<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Repository\ProfileRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProfileRepository::class)]
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
        new Mutation(
            name: 'update',
            normalizationContext: [
                'groups' => [self::READ],
            ],
            denormalizationContext: [
                'groups' => [self::UPDATE],
            ],
            validationContext: [
                'groups' => [self::UPDATE],
            ],
            security: '
                is_granted("ROLE_ADMIN") or
                (object.getUser() == user and user.getStatus() == enum("App\\\Enum\\\UserStatusEnum::Verified"))
            ',
        ),
    ]
)]
class Profile
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'profile:read';
    public const UPDATE = 'profile:update';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ, self::UPDATE, User::READ, User::READ_PUBLIC])]
    #[Assert\Length(
        groups: [self::UPDATE],
        max: 1000,
        maxMessage: 'profile.description.max_length'
    )]
    private ?string $description = null;

    #[ORM\OneToOne(mappedBy: 'profile', targetEntity: User::class, cascade: ['persist', 'remove'])]
    private ?User $user = null;

    public function getId(): ?Uuid
    {
        return $this->id;
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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        // set the owning side of the relation if necessary
        if ($user->getProfile() !== $this) {
            $user->setProfile($this);
        }

        $this->user = $user;

        return $this;
    }
}
