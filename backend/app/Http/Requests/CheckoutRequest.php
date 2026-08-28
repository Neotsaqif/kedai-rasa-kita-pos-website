<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'payment_method'       => ['required', 'string', 'in:cash,qris,debit,credit'],
            'amount_paid'          => ['required', 'numeric', 'min:0'],
        ];
    }
}
