<?php

namespace App\Entity\Traits;

use ApiPlatform\Metadata\ApiProperty;
use App\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Serializer\Annotation\Groups;

trait BlameableTrait
{
    public const BLAMEABLE = 'blameable';

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'created_by_id', referencedColumnName: 'id', nullable: true)]
    #[Gedmo\Blameable(on: 'create')]
    #[ApiProperty(security: 'is_granted("ROLE_ADMIN")')]
    #[Groups([self::BLAMEABLE])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'updated_by_id', referencedColumnName: 'id', nullable: true)]
    #[Gedmo\Blameable(on: 'update')]
    #[ApiProperty(security: 'is_granted("ROLE_ADMIN")')]
    #[Groups([self::BLAMEABLE])]
    private ?User $updatedBy = null;

    public function getCreatedBy(): ?User
    {
        if ($this === $this->createdBy) {
            return null;
        }

        return $this->createdBy;
    }

    public function setCreatedBy(?User $user): static
    {
        $this->createdBy = $user;

        return $this;
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

    public function setUpdatedBy(?User $user): static
    {
        $this->updatedBy = $user;

        return $this;
    }
}
