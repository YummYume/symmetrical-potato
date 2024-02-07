<?php

namespace App\Service;

final class AssetRefund
{
    public function __construct()
    {
    }

    /**
     * @description Refund the asset, when the asset is deleted
     */
    public function refundAsset(int $assetId, int $quantity): void
    {
    }

    /**
     * @description Refund assets of a heist, when the heist is deleted
     */
    public function refundAssetsOfHeist(int $heistId): void
    {
    }
}
