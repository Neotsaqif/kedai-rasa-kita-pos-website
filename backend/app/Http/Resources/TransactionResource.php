<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'order_id'       => $this->order_id,
            'transaction_no' => $this->transaction_no,
            'amount'         => (float) $this->amount,
            'status'         => $this->status,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
