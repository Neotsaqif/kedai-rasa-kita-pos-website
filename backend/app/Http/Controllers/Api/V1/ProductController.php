<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->successResponse([], 'Products retrieved successfully');
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        return $this->successResponse(null, 'Product created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Product details retrieved successfully');
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        return $this->successResponse(null, 'Product updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Product deleted successfully');
    }
}
