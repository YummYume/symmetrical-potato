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
use App\Enum\ContractorRequestStatusEnum;
use App\Filter\MatchFilter;
use App\Repository\ContractorRequestRepository;
use App\State\ContractorRequestProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ContractorRequestRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    processor: ContractorRequestProcessor::class,
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("READ", object)',
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            security: 'is_granted("ROLE_ADMIN")',
        ),
        new Mutation(
            name: 'create',
            denormalizationContext: [
                'groups' => [self::WRITE],
            ],
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            validationContext: ['groups' => [self::WRITE]],
            securityPostDenormalize: 'is_granted("CREATE", object)'
        ),
        new Mutation(
            name: 'update',
            denormalizationContext: [
                'groups' => [self::WRITE_ADMIN],
            ],
            normalizationContext: [
                'groups' => [self::READ, self::BLAMEABLE, self::TIMESTAMPABLE],
            ],
            validationContext: [
                'groups' => [self::WRITE_ADMIN],
            ],
            security: 'is_granted("UPDATE", object)'
        ),
        new DeleteMutation(
            name: 'delete',
            security: 'is_granted("DELETE", object)'
        ),
    ]
)]
#[ApiFilter(MatchFilter::class, properties: ['status'])]
class ContractorRequest
{
    use BlameableTrait;
    use TimestampableTrait;

    public const READ = 'contractor_request:read';
    public const WRITE = 'contractor_request:write';
    public const WRITE_ADMIN = 'contractor_request:write:admin';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([self::READ, self::WRITE, User::READ])]
    #[Assert\NotBlank(groups: [self::WRITE], message: 'contractor_request.reason.not_blank')]
    #[Assert\Length(
        min: 10,
        max: 1000,
        minMessage: 'contractor_request.reason.min',
        maxMessage: 'contractor_request.reason.max',
        groups: [self::WRITE]
    )]
    private ?string $reason = null;

    #[ORM\Column(length: 50, enumType: ContractorRequestStatusEnum::class)]
    #[Groups([self::READ, self::WRITE_ADMIN, User::READ])]
    #[Assert\Choice(
        choices: [ContractorRequestStatusEnum::Accepted, ContractorRequestStatusEnum::Rejected],
        groups: [self::WRITE_ADMIN],
        message: 'contractor_request.status.not_pending'
    )]
    private ContractorRequestStatusEnum $status = ContractorRequestStatusEnum::Pending;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::READ, self::WRITE_ADMIN, User::READ])]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'contractor_request.admin_comment.max_length',
        groups: [self::WRITE_ADMIN]
    )]
    private ?string $adminComment = null;

    #[ORM\OneToOne(mappedBy: 'contractorRequest', targetEntity: User::class)]
    #[Groups([self::READ])]
    private ?User $user = null;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(string $reason): static
    {
        $this->reason = $reason;

        return $this;
    }

    public function getStatus(): ContractorRequestStatusEnum
    {
        return $this->status;
    }

    public function setStatus(ContractorRequestStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getAdminComment(): ?string
    {
        return $this->adminComment;
    }

    public function setAdminComment(?string $adminComment): static
    {
        $this->adminComment = $adminComment;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        // unset the owning side of the relation if necessary
        if (null === $user && null !== $this->user) {
            $this->user->setContractorRequest(null);
        }

        // set the owning side of the relation if necessary
        if (null !== $user && $user->getContractorRequest() !== $this) {
            $user->setContractorRequest($this);
        }

        $this->user = $user;

        return $this;
    }
}
