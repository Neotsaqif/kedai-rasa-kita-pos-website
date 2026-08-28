<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->successResponse([], 'Transactions retrieved successfully');
    }

    public function show(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Transaction details retrieved successfully');
    }
}
