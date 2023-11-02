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
use App\Enum\UserLocaleEnum;
use App\Repository\UserRepository;
use App\Resolver\UserMutationResolver;
use App\Resolver\UserQueryResolver;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => ['user:read:public'],
            ]
        ),
        new QueryCollection(),
        new Mutation(name: 'create'),
        new Mutation(name: 'update'),
        new DeleteMutation(name: 'delete'),
        new Query(
            name: 'me',
            resolver: UserQueryResolver::class,
            args: [],
            normalizationContext: [
                'groups' => ['user:read'],
            ],
        ),
        new Mutation(
            name: 'login',
            resolver: UserMutationResolver::class,
            write: false,
            validate: false,
            args: [
                'username' => [
                    'type' => 'String!',
                    'description' => 'The username of the user to authenticate.',
                ],
                'password' => [
                    'type' => 'String!',
                    'description' => 'The password of the user to authenticate.',
                ],
            ],
            normalizationContext: [
                'groups' => ['user:login'],
            ],
        ),
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use BlameableTrait;
    use TimestampableTrait;

    public const ROLE_USER = 'ROLE_USER';
    public const ROLE_HEISTER = 'ROLE_HEISTER';
    public const ROLE_EMPLOYEE = 'ROLE_EMPLOYEE';
    public const ROLE_CONTRACTOR = 'ROLE_CONTRACTOR';
    public const ROLE_ADMIN = 'ROLE_ADMIN';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[ApiProperty]
    #[Groups(['user:read', 'user:read:public'])]
    private ?string $username = null;

    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    private ?string $plainPassword = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty]
    #[Groups(['user:read'])]
    private ?string $email = null;

    #[ORM\Column]
    #[ApiProperty]
    #[Groups(['user:read'])]
    private float $balance = 0.0;

    // This will be calculated by a cron job
    #[ORM\Column(nullable: true)]
    #[ApiProperty]
    #[Groups(['user:read'])]
    private ?float $globalRating = null;

    #[ORM\Column(length: 5, enumType: UserLocaleEnum::class)]
    #[ApiProperty]
    #[Groups(['user:read'])]
    private UserLocaleEnum $locale = UserLocaleEnum::En;

    #[ORM\OneToOne(inversedBy: 'user', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profile $profile = null;

    #[ORM\OneToOne(inversedBy: 'user', cascade: ['persist', 'remove'])]
    private ?ContractorRequest $contractorRequest = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Review::class, orphanRemoval: true)]
    private Collection $reviews;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: CrewMember::class, orphanRemoval: true)]
    private Collection $crewMembers;

    #[ORM\OneToOne(inversedBy: 'user', cascade: ['persist', 'remove'])]
    private ?Employee $employee = null;

    #[ORM\OneToMany(mappedBy: 'contractor', targetEntity: Establishment::class)]
    private Collection $establishments;

    #[ApiProperty]
    #[Groups(['user:login'])]
    private ?string $token = null;

    #[ApiProperty]
    #[Groups(['user:login'])]
    private ?int $tokenTtl = null;

    public function __construct()
    {
        $this->reviews = new ArrayCollection();
        $this->crewMembers = new ArrayCollection();
        $this->establishments = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;

        // Every user has the "user" role
        $roles[] = self::ROLE_USER;

        // Filter out mutually exclusive roles (e.g. a contractor cannot be a heister nor an employee)
        $mutuallyExclusiveRoles = self::getMutuallyExclusiveRoles();
        $roles = match (true) {
            \in_array(self::ROLE_CONTRACTOR, $roles, true) => array_filter(
                $roles,
                static fn (string $role): bool => !\in_array($role, $mutuallyExclusiveRoles[self::ROLE_CONTRACTOR], true)
            ),
            \in_array(self::ROLE_EMPLOYEE, $roles, true) => array_filter(
                $roles,
                static fn (string $role): bool => !\in_array($role, $mutuallyExclusiveRoles[self::ROLE_EMPLOYEE], true)
            ),
            \in_array(self::ROLE_HEISTER, $roles, true) => array_filter(
                $roles,
                static fn (string $role): bool => !\in_array($role, $mutuallyExclusiveRoles[self::ROLE_HEISTER], true)
            ),
            default => $roles,
        };

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function addRole(string $role): static
    {
        if (\in_array($role, self::getAllowedRoles(), true)) {
            $mutuallyExclusiveRoles = self::getMutuallyExclusiveRoles();

            if (\in_array($role, $mutuallyExclusiveRoles, true)) {
                $this->roles = array_filter(
                    $this->roles,
                    static fn (string $existingRole): bool => !\in_array($existingRole, $mutuallyExclusiveRoles[$role], true)
                );
            }

            $this->roles[] = $role;
        }

        return $this;
    }

    public function removeRole(string $role): static
    {
        $this->roles = array_filter($this->roles, static fn (string $existingRole): bool => $role !== $existingRole);

        return $this;
    }

    public static function getAllowedRoles(): array
    {
        return [
            self::ROLE_USER,
            self::ROLE_HEISTER,
            self::ROLE_EMPLOYEE,
            self::ROLE_CONTRACTOR,
            self::ROLE_ADMIN,
        ];
    }

    public static function getMutuallyExclusiveRoles(): array
    {
        return [
            self::ROLE_HEISTER => [self::ROLE_EMPLOYEE, self::ROLE_CONTRACTOR],
            self::ROLE_EMPLOYEE => [self::ROLE_HEISTER, self::ROLE_CONTRACTOR],
            self::ROLE_CONTRACTOR => [self::ROLE_HEISTER, self::ROLE_EMPLOYEE],
        ];
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getBalance(): float
    {
        return $this->balance;
    }

    public function setBalance(float $balance): static
    {
        $this->balance = $balance;

        return $this;
    }

    public function getGlobalRating(): ?float
    {
        return $this->globalRating;
    }

    public function setGlobalRating(?float $globalRating): static
    {
        $this->globalRating = $globalRating;

        return $this;
    }

    public function getLocale(): UserLocaleEnum
    {
        return $this->locale;
    }

    public function setLocale(UserLocaleEnum $locale): static
    {
        $this->locale = $locale;

        return $this;
    }

    public function getProfile(): ?Profile
    {
        return $this->profile;
    }

    public function setProfile(Profile $profile): static
    {
        $this->profile = $profile;

        return $this;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function createEmptyProfile(): void
    {
        if (null !== $this->profile) {
            return;
        }

        $this->profile = (new Profile())
            ->setUser($this)
        ;
    }

    public function getContractorRequest(): ?ContractorRequest
    {
        return $this->contractorRequest;
    }

    public function setContractorRequest(?ContractorRequest $contractorRequest): static
    {
        $this->contractorRequest = $contractorRequest;

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
            $review->setUser($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            // set the owning side to null (unless already changed)
            if ($review->getUser() === $this) {
                $review->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CrewMember>
     */
    public function getCrewMembers(): Collection
    {
        return $this->crewMembers;
    }

    public function addCrewMember(CrewMember $crewMember): static
    {
        if (!$this->crewMembers->contains($crewMember)) {
            $this->crewMembers->add($crewMember);
            $crewMember->setUser($this);
        }

        return $this;
    }

    public function removeCrewMember(CrewMember $crewMember): static
    {
        if ($this->crewMembers->removeElement($crewMember)) {
            // set the owning side to null (unless already changed)
            if ($crewMember->getUser() === $this) {
                $crewMember->setUser(null);
            }
        }

        return $this;
    }

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;

        return $this;
    }

    /**
     * @return Collection<int, Establishment>
     */
    public function getEstablishments(): Collection
    {
        return $this->establishments;
    }

    public function addEstablishment(Establishment $establishment): static
    {
        if (!$this->establishments->contains($establishment)) {
            $this->establishments->add($establishment);
            $establishment->setContractor($this);
        }

        return $this;
    }

    public function removeEstablishment(Establishment $establishment): static
    {
        if ($this->establishments->removeElement($establishment)) {
            // set the owning side to null (unless already changed)
            if ($establishment->getContractor() === $this) {
                $establishment->setContractor(null);
            }
        }

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getTokenTtl(): ?int
    {
        return $this->tokenTtl;
    }

    public function setTokenTtl(?int $tokenTtl): static
    {
        $this->tokenTtl = $tokenTtl;

        return $this;
    }
}
