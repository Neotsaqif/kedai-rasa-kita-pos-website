<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(): JsonResponse
    {
        return $this->successResponse([
            'today_sales'      => 0,
            'today_orders'     => 0,
            'active_products'  => 0,
            'low_stock_alerts' => 0,
        ], 'Dashboard summary retrieved successfully');
    }
}
