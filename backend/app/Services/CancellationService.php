<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CancellationService
{
    public function cancelOrder(string $orderId, string $reason, int $userId): array
    {
        return DB::transaction(function () use ($orderId, $reason, $userId) {
            // Restore stock, update order status to cancelled
            return [
                'order_id' => $orderId,
                'status'   => 'cancelled',
                'reason'   => $reason,
            ];
        });
    }
}
