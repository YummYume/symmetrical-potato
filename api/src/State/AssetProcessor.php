<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Asset;
use App\Service\Refunder;
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
        private readonly Refunder $refunder,
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

        $this->refunder->refundAsset($data);

        return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
