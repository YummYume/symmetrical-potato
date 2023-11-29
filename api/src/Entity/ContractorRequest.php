<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\ContractorRequestStatusEnum;
use App\Repository\ContractorRequestRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ContractorRequestRepository::class)]
#[ApiResource(
    security: 'is_granted("ROLE_USER")',
    operations: [],
    graphQlOperations: [
        new Query(
            normalizationContext: [
                'groups' => ['contractor_request:read'],
            ],
            security: 'is_granted("ROLE_ADMIN") or object.user == user',
            securityMessage: 'Unauthorized.',
        ),
        new QueryCollection(
            normalizationContext: [
                'groups' => ['contractor_request:read'],
            ],
            security: 'is_granted("ROLE_ADMIN") or is_granted("ROLE_CONTRACTOR")'
        ),
        new Mutation(
            name: 'create',
            security: '
                is_granted("ROLE_USER") and
                not is_granted("ROLE_CONTRACTOR") and
                (
                    user.getContractorRequest() == null or
                    user.getContractorRequest().getStatus() == enum("App\\\Enum\\\ContractorRequestStatusEnum::Rejected")
                )
            ',
            securityMessage: 'Unauthorized.',
            securityPostDenormalize: 'object.getUser() == user',
            securityPostDenormalizeMessage: 'Unauthorized.',
            denormalizationContext: [
                'groups' => ['contractor_request:write'],
            ],
            normalizationContext: [
                'groups' => ['contractor_request:read'],
            ],
        ),
    ]
)]
class ContractorRequest
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[ApiProperty(identifier: true)]
    #[Groups('contractor_request:read')]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['contractor_request:read', 'contractor_request:write'])]
    private ?string $reason = null;

    #[ORM\Column(length: 50, enumType: ContractorRequestStatusEnum::class)]
    #[Groups(['contractor_request:read', 'contractor_request:write:admin'])]
    private ContractorRequestStatusEnum $status = ContractorRequestStatusEnum::Pending;

    #[ORM\OneToOne(mappedBy: 'contractorRequest', cascade: ['persist', 'remove'])]
    #[Groups(['contractor_request:read:admin', 'contractor_request:write'])]
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
