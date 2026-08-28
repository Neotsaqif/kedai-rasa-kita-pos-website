<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'category_id' => $this->category_id,
            'name'        => $this->name,
            'price'       => (float) $this->price,
            'stock'       => (int) $this->stock,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
