<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse([
            'store_name'  => 'Kedai Rasa Kita',
            'tax_percentage' => 10,
            'receipt_footer' => 'Terima kasih telah berkunjung!',
        ], 'Settings retrieved successfully');
    }

    public function update(Request $request): JsonResponse
    {
        return $this->successResponse(null, 'Settings updated successfully');
    }
}
