<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse([], 'Categories retrieved successfully');
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        return $this->successResponse(null, 'Category created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Category details retrieved successfully');
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return $this->successResponse(null, 'Category updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Category deleted successfully');
    }
}
