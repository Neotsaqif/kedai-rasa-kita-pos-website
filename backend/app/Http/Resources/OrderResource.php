<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'order_number'   => $this->order_number,
            'user_id'        => $this->user_id,
            'total_amount'   => (float) $this->total_amount,
            'status'         => $this->status,
            'payment_status' => $this->payment_status,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
