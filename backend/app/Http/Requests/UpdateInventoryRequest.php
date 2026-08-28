<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer'],
            'type'     => ['required', 'string', 'in:restock,adjustment,damage'],
            'reason'   => ['nullable', 'string'],
        ];
    }
}
