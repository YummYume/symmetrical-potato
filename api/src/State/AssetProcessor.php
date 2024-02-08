<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Asset;
use App\Service\Refund;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Asset, Asset>
 */
final class AssetProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Asset, Asset> $persistProcessor
     * @param ProcessorInterface<Asset, Asset> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly Refund $refund,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?Asset
    {
        if (!$data instanceof Asset || !$operation instanceof DeleteMutation) {
            if ($operation instanceof DeleteMutation) {
                return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
            }

            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $this->refund->refundAsset($data);

        return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
