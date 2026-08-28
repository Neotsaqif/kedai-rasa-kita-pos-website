<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Resources\StaffResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse([], 'Staff members retrieved successfully');
    }

    public function store(StoreStaffRequest $request): JsonResponse
    {
        return $this->successResponse(null, 'Staff member created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Staff details retrieved successfully');
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return $this->successResponse(null, 'Staff member updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Staff member deactivated successfully');
    }
}
