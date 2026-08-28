<?php

namespace App\Services;

class ReceiptService
{
    public function generateReceipt(string $orderId): array
    {
        return [
            'order_id'   => $orderId,
            'receipt_no' => 'RCP-' . time(),
        ];
    }
}
