<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\HeistPhaseEnum;
use App\Enum\UserLocaleEnum;
use App\Enum\UserStatusEnum;
use App\Filter\RoleFilter;
use App\Filter\UuidFilter;
use App\Repository\UserRepository;
use App\Resolver\UserMutationResolver;
use App\Resolver\UserQueryResolver;
use App\State\UserProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [],
    processor: UserProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("READ_PUBLIC", object)'
        ),
        new Query(
            name: 'get',
            shortName: 'MeUser',
            resolver: UserQueryResolver::class,
            args: [],
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ]
        ),
        // Name has to be different from the "get" above to avoid conflicts (yes this is cursed)
        new Query(
            name: 'getReset',
            shortName: 'TokenUser',
            resolver: UserQueryResolver::class,
            normalizationContext: [
                'groups' => [],
            ],
            args: [
                'resetToken' => [
                    'type' => 'String!',
                    'description' => 'The reset token to use to reset the password.',
                ],
            ],
            security: 'user == null'
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ_PUBLIC, self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("ROLE_USER")'
        ),
        new Mutation(
            name: 'create',
            normalizationContext: [
                'groups' => [self::REGISTER_READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::REGISTER],
            ],
            validationContext: [
                'groups' => [self::REGISTER],
            ],
            security: 'user == null',
        ),
        new Mutation(
            name: 'update',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::UPDATE, self::UPDATE_ADMIN],
            ],
            validationContext: [
                'groups' => [self::UPDATE],
            ],
            security: 'is_granted("UPDATE", object)',
        ),
        new Mutation(
            name: 'validate',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::VALIDATE],
            ],
            validationContext: [
                'groups' => [self::VALIDATE],
            ],
            security: 'is_granted("VALIDATE", object)',
        ),
        new Mutation(
            name: 'kill',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::KILL],
            ],
            validationContext: [
                'groups' => [self::KILL],
            ],
            security: 'is_granted("KILL", object)',
        ),
        new Mutation(
            name: 'revive',
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            denormalizationContext: [
                'groups' => [self::REVIVE],
            ],
            validationContext: [
                'groups' => [self::REVIVE],
            ],
            security: 'is_granted("REVIVE", object)',
        ),
        new Mutation(
            name: 'requestResetPassword',
            resolver: UserMutationResolver::class,
            args: [
                'email' => [
                    'type' => 'String!',
                    'description' => 'The email of the user who wants to reset their password.',
                ],
                'username' => [
                    'type' => 'String!',
                    'description' => 'The username of the user who wants to reset their password.',
                ],
            ],
            validate: false,
            read: false,
            write: false,
            security: 'user == null',
        ),
        new Mutation(
            name: 'resetPassword',
            resolver: UserMutationResolver::class,
            normalizationContext: [
                'groups' => [self::RESET_READ],
            ],
            denormalizationContext: [
                'groups' => [self::RESET_WRITE],
            ],
            validationContext: [
                'groups' => [self::RESET_WRITE],
            ],
            args: [
                'plainPassword' => [
                    'type' => 'String!',
                    'description' => 'The new password of the user.',
                ],
                'resetToken' => [
                    'type' => 'String!',
                    'description' => 'The reset token to use to reset the password.',
                ],
            ],
            read: false,
            security: 'user == null',
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)'
        ),
    ]
)]
#[UniqueEntity(
    fields: ['username'],
    errorPath: 'username',
    message: 'user.username.unique',
    groups: [self::REGISTER]
)]
#[UniqueEntity(
    fields: ['email'],
    errorPath: 'email',
    message: 'user.email.unique',
    groups: [self::REGISTER, self::UPDATE]
)]
#[ApiFilter(UuidFilter::class, properties: ['forbiddenHeists.id'])]
// TODO: Only with admin
#[ApiFilter(RoleFilter::class, properties: ['roles'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'user:read';
    public const READ_PUBLIC = 'user:read:public';
    public const REGISTER = 'user:register';
    public const REGISTER_READ = 'user:register:read';
    public const VALIDATE = 'user:validate';
    public const KILL = 'user:kill';
    public const REVIVE = 'user:revive';
    public const UPDATE = 'user:update';
    public const UPDATE_ADMIN = 'user:update:admin';
    // Purposely unused
    public const RESET_READ = 'user:reset:read';
    public const RESET_WRITE = 'user:reset:write';

    public const RESET_TOKEN_TTL = '3600'; // 1 hour

    public const ROLE_USER = 'ROLE_USER';
    public const ROLE_HEISTER = 'ROLE_HEISTER';
    public const ROLE_EMPLOYEE = 'ROLE_EMPLOYEE';
    public const ROLE_CONTRACTOR = 'ROLE_CONTRACTOR';
    public const ROLE_ADMIN = 'ROLE_ADMIN';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_CONTRACTOR,
        self::ROLE_EMPLOYEE,
        self::ROLE_HEISTER,
        self::ROLE_USER,
    ];

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups([
        self::READ,
        self::READ_PUBLIC,
        self::REGISTER,
        self::BLAMEABLE,
        ContractorRequest::READ,
        Heist::READ,
        Review::READ_PUBLIC,
        CrewMember::READ,
        CrewMember::READ_PUBLIC,
        Establishment::READ_PUBLIC,
        Employee::READ,
    ])]
    #[Assert\NotBlank(groups: [self::REGISTER], message: 'user.username.not_blank')]
    #[Assert\Length(
        groups: [self::REGISTER],
        min: 2,
        max: 100,
        minMessage: 'user.username.min_length',
        maxMessage: 'user.username.max_length'
    )]
    private ?string $username = null;

    /** @var array<string> */
    #[ORM\Column]
    #[ApiProperty(security: '')]
    #[Groups([self::READ])]
    private array $roles = [];

    /**
     * @var ?string The hashed password
     */
    #[ORM\Column]
    #[Ignore]
    private ?string $password = null;

    #[ApiProperty(security: '')]
    #[Groups([self::REGISTER, self::UPDATE, self::RESET_WRITE])]
    #[Assert\NotBlank(groups: [self::REGISTER, self::RESET_WRITE], message: 'user.password.not_blank')]
    #[Assert\Length(
        groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE],
        min: 8,
        max: 100,
        minMessage: 'user.password.min_length',
        maxMessage: 'user.password.max_length'
    )]
    #[Assert\Regex(
        groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE],
        pattern: '/[\d]/',
        message: 'user.password.at_least_one_digit'
    )]
    #[Assert\Regex(
        groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE],
        pattern: '/[A-Z]/',
        message: 'user.password.at_least_one_uppercase_letter'
    )]
    #[Assert\Regex(
        groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE],
        pattern: '/[a-z]/',
        message: 'user.password.at_least_one_lowercase_letter'
    )]
    #[Assert\Regex(
        groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE],
        pattern: '/[!@#$%^&*()\-_=+;:,<.>]/',
        message: 'user.password.at_least_one_special_character'
    )]
    #[Assert\NotCompromisedPassword(groups: [self::REGISTER, self::UPDATE, self::RESET_WRITE], message: 'user.plain_password.not_compromised')]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 255)]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, self::REGISTER, self::UPDATE, ContractorRequest::READ])]
    #[Assert\NotBlank(groups: [self::REGISTER, self::UPDATE], message: 'user.email.not_blank')]
    #[Assert\Email(groups: [self::REGISTER, self::UPDATE], message: 'user.email.invalid')]
    #[Assert\Length(
        groups: [self::REGISTER, self::UPDATE],
        min: 3,
        max: 255,
        minMessage: 'user.email.min_length',
        maxMessage: 'user.email.max_length'
    )]
    private ?string $email = null;

    #[ORM\Column]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, self::UPDATE_ADMIN])]
    private float $balance = 0.0;

    #[ORM\Column(nullable: true)]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private ?float $globalRating = null;

    #[ORM\Column(type: Types::TEXT)]
    #[ApiProperty(security: '')]
    #[Groups([self::REGISTER, self::READ])]
    #[Assert\NotBlank(groups: [self::REGISTER], message: 'user.reason.not_blank')]
    #[Assert\Length(
        groups: [self::REGISTER],
        min: 10,
        max: 2000,
        minMessage: 'user.reason.min_length',
        maxMessage: 'user.reason.max_length'
    )]
    private ?string $reason = null;

    #[ORM\Column(length: 20, enumType: UserStatusEnum::class)]
    #[ApiProperty(security: '')]
    #[Groups([self::VALIDATE, self::KILL, self::REVIVE, self::READ])]
    #[Assert\NotBlank(groups: [self::VALIDATE, self::KILL, self::REVIVE], message: 'user.status.not_blank')]
    #[Assert\EqualTo(groups: [self::VALIDATE], value: UserStatusEnum::Verified, message: 'user.status.must_be_verified')]
    #[Assert\EqualTo(groups: [self::KILL], value: UserStatusEnum::Dead, message: 'user.status.must_be_dead')]
    #[Assert\EqualTo(groups: [self::REVIVE], value: UserStatusEnum::Verified, message: 'user.status.must_be_verified')]
    private UserStatusEnum $status = UserStatusEnum::Unverified;

    #[ORM\Column(length: 5, enumType: UserLocaleEnum::class)]
    #[ApiProperty(security: '')]
    #[Groups([self::READ, self::REGISTER, self::UPDATE])]
    private UserLocaleEnum $locale = UserLocaleEnum::En;

    #[ORM\Column(nullable: true)]
    #[Ignore]
    private ?string $resetToken = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Ignore]
    private ?\DateTimeInterface $resetTokenRequestedAt = null;

    #[ORM\OneToOne(inversedBy: 'user', targetEntity: Profile::class, cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([
        self::READ,
        self::READ_PUBLIC,
        ContractorRequest::READ,
        Heist::READ,
        Review::READ_PUBLIC,
        CrewMember::READ,
        CrewMember::READ_PUBLIC,
        Establishment::READ_PUBLIC,
        Employee::READ,
    ])]
    private ?Profile $profile = null;

    #[ORM\OneToOne(inversedBy: 'user', targetEntity: ContractorRequest::class, orphanRemoval: true)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[ApiProperty(security: '')]
    #[Groups([self::READ])]
    private ?ContractorRequest $contractorRequest = null;

    /** @var ArrayCollection<int, Review> */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Review::class, orphanRemoval: true)]
    private Collection $reviews;

    /** @var ArrayCollection<int, CrewMember> */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: CrewMember::class, orphanRemoval: true)]
    private Collection $crewMembers;

    #[ORM\OneToOne(inversedBy: 'user', targetEntity: Employee::class, orphanRemoval: true)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private ?Employee $employee = null;

    /** @var ArrayCollection<int, Establishment> */
    #[ORM\OneToMany(mappedBy: 'contractor', targetEntity: Establishment::class, orphanRemoval: true)]
    #[Groups([self::READ, self::READ_PUBLIC])]
    private Collection $establishments;

    /** @var ArrayCollection<int, Heist> */
    #[ORM\ManyToMany(targetEntity: Heist::class, mappedBy: 'forbiddenUsers')]
    private Collection $forbiddenHeists;

    public function __construct()
    {
        $this->reviews = new ArrayCollection();
        $this->crewMembers = new ArrayCollection();
        $this->establishments = new ArrayCollection();
        $this->forbiddenHeists = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): static
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

        return array_values(array_unique($roles));
    }

    /**
     * @return 'ROLE_HEISTER'|'ROLE_EMPLOYEE'|'ROLE_CONTRACTOR'|null
     */
    #[ApiProperty]
    #[Groups([
        self::READ,
        self::READ_PUBLIC,
        ContractorRequest::READ,
        Heist::READ,
        Review::READ_PUBLIC,
        CrewMember::READ,
        CrewMember::READ_PUBLIC,
        Establishment::READ_PUBLIC,
        Employee::READ,
    ])]
    public function getMainRole(): ?string
    {
        return match (true) {
            \in_array(self::ROLE_HEISTER, $this->roles, true) => self::ROLE_HEISTER,
            \in_array(self::ROLE_EMPLOYEE, $this->roles, true) => self::ROLE_EMPLOYEE,
            \in_array(self::ROLE_CONTRACTOR, $this->roles, true) => self::ROLE_CONTRACTOR,
            default => null,
        };
    }

    /**
     * @param array<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function addRole(string $role): static
    {
        if (\in_array($role, self::getAllowedRoles(), true)) {
            $mutuallyExclusiveRoles = self::getMutuallyExclusiveRoles();

            if (\in_array($role, array_keys($mutuallyExclusiveRoles), true)) {
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

    /**
     * @return array<string>
     */
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

    /**
     * @return array<string, array<string>>
     */
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
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
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

    public function setEmail(?string $email): static
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
        $this->balance = min(max($balance, \PHP_INT_MIN), \PHP_INT_MAX);

        return $this;
    }

    public function getGlobalRating(): ?float
    {
        return $this->globalRating;
    }

    /**
     * You should probably not use this method directly unless necessary.
     * The user's global rating is automatically computed on a regular basis.
     *
     * @see User::computeGlobalRating()
     */
    public function setGlobalRating(?float $globalRating): static
    {
        $this->globalRating = $globalRating;

        return $this;
    }

    /**
     * Computes the global rating of the user based on the ratings of all their completed heists (success or failure).
     * This method can be resource intensive if the user has a lot of completed heists.
     * Typically, this method should only be called in an external command that will do the computation in the background.
     */
    public function computeGlobalRating(): static
    {
        $crewMembers = $this->getCrewMembers()->filter(static function (CrewMember $crewMember): bool {
            return HeistPhaseEnum::isFinished($crewMember->getHeist()->getPhase());
        });

        if (0 === $crewMembers->count()) {
            $this->globalRating = null;

            return $this;
        }

        $totalRating = array_reduce(
            $crewMembers->toArray(),
            static fn (float $totalRating, CrewMember $crewMember): float => $totalRating + $crewMember->getRating(),
            0.0
        );

        $this->globalRating = round($totalRating / $crewMembers->count(), 2);

        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = $reason;

        return $this;
    }

    public function getStatus(): UserStatusEnum
    {
        return $this->status;
    }

    public function setStatus(UserStatusEnum $status): static
    {
        $this->status = $status;

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

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): static
    {
        $this->resetToken = $resetToken;

        return $this;
    }

    public function getResetTokenRequestedAt(): ?\DateTimeInterface
    {
        return $this->resetTokenRequestedAt;
    }

    public function setResetTokenRequestedAt(?\DateTimeInterface $resetTokenRequestedAt): static
    {
        $this->resetTokenRequestedAt = $resetTokenRequestedAt;

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
            $forbiddenHeist->addForbiddenUser($this);
        }

        return $this;
    }

    public function removeForbiddenHeist(Heist $forbiddenHeist): static
    {
        if ($this->forbiddenHeists->removeElement($forbiddenHeist)) {
            $forbiddenHeist->removeForbiddenUser($this);
        }

        return $this;
    }

    // Overrides
    public function getCreatedBy(): ?User
    {
        if ($this === $this->createdBy) {
            return null;
        }

        return $this->createdBy;
    }

    public function getUpdatedBy(): ?User
    {
        // Some weird bug with ApiPlatform/GraphQL... If createdBy/updatedBy is equal to $this, it will throw an error
        // Seems related to https://github.com/api-platform/api-platform/issues/2489 (same error)
        if ($this === $this->updatedBy) {
            return null;
        }

        return $this->updatedBy;
    }
}
