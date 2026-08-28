<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    use ApiResponse;

    public function check(): JsonResponse
    {
        return $this->successResponse([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
        ], 'API is running successfully');
    }
}
