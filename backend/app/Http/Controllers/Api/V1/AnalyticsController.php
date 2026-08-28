<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponse;

    public function reports(Request $request): JsonResponse
    {
        return $this->successResponse([
            'period'         => $request->get('period', 'daily'),
            'total_revenue'  => 0,
            'top_products'   => [],
        ], 'Analytics reports retrieved successfully');
    }
}
