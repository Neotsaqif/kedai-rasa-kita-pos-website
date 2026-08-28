<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'product_id' => $this->product_id,
            'quantity'   => (int) $this->quantity,
            'type'       => $this->type,
            'reason'     => $this->reason,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
