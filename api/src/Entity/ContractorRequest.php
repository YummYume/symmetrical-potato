<?php

namespace App\Entity;

use App\Entity\Traits\BlameableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Enum\ContractorRequestStatusEnum;
use App\Repository\ContractorRequestRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ContractorRequestRepository::class)]
class ContractorRequest
{
    use BlameableTrait;
    use TimestampableTrait;

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $reason = null;

    #[ORM\Column(length: 50, enumType: ContractorRequestStatusEnum::class)]
    private ContractorRequestStatusEnum $status = ContractorRequestStatusEnum::Pending;

    #[ORM\OneToOne(mappedBy: 'contractorRequest', cascade: ['persist', 'remove'])]
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
