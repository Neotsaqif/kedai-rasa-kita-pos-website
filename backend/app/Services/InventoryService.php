<?php

namespace App\Services;

class InventoryService
{
    public function adjustStock(int $productId, int $quantity, string $type, ?string $reason = null): array
    {
        return [
            'product_id' => $productId,
            'quantity'   => $quantity,
            'type'       => $type,
            'reason'     => $reason,
        ];
    }
}
