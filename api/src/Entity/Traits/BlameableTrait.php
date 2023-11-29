<?php

namespace App\Entity\Traits;

use ApiPlatform\Metadata\ApiProperty;
use App\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Serializer\Annotation\Groups;

trait BlameableTrait
{
    public const BLAMEABLE = 'able:blameable';

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'created_by_id', referencedColumnName: 'id', nullable: true)]
    #[Gedmo\Blameable(on: 'create')]
    #[ApiProperty]
    #[Groups([self::BLAMEABLE])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'updated_by_id', referencedColumnName: 'id', nullable: true)]
    #[Gedmo\Blameable(on: 'update')]
    #[ApiProperty]
    #[Groups([self::BLAMEABLE])]
    private ?User $updatedBy = null;

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $user): static
    {
        $this->createdBy = $user;

        return $this;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    public function setUpdatedBy(?User $user): static
    {
        $this->updatedBy = $user;

        return $this;
    }
}
