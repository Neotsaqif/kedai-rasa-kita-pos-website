<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInventoryRequest;
use App\Services\InventoryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    use ApiResponse;

    public function __construct(protected InventoryService $inventoryService) {}

    public function index(): JsonResponse
    {
        return $this->successResponse([], 'Inventory logs retrieved successfully');
    }

    public function restock(UpdateInventoryRequest $request, string $id): JsonResponse
    {
        $result = $this->inventoryService->adjustStock(
            (int) $id,
            $request->validated('quantity'),
            $request->validated('type'),
            $request->validated('reason')
        );

        return $this->successResponse($result, 'Inventory updated successfully');
    }
}
