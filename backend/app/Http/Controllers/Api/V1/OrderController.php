<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelOrderRequest;
use App\Http\Requests\CheckoutRequest;
use App\Services\CancellationService;
use App\Services\CheckoutService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected CheckoutService $checkoutService,
        protected CancellationService $cancellationService
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse([], 'Orders retrieved successfully');
    }

    public function show(string $id): JsonResponse
    {
        return $this->successResponse(null, 'Order details retrieved successfully');
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $result = $this->checkoutService->processCheckout(
            $request->validated(),
            $request->user()->id ?? 1
        );

        return $this->successResponse($result, 'Checkout completed successfully', 201);
    }

    public function cancel(CancelOrderRequest $request, string $id): JsonResponse
    {
        $result = $this->cancellationService->cancelOrder(
            $id,
            $request->validated('reason'),
            $request->user()->id ?? 1
        );

        return $this->successResponse($result, 'Order cancelled successfully');
    }
}
