<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public Routes
    Route::get('/health', [HealthController::class, 'check']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Cashier & Admin Shared Access
        Route::middleware('role:admin,cashier')->group(function () {
            Route::get('/categories', [CategoryController::class, 'index']);
            Route::get('/categories/{category}', [CategoryController::class, 'show']);

            Route::get('/products', [ProductController::class, 'index']);
            Route::get('/products/{product}', [ProductController::class, 'show']);

            Route::get('/orders', [OrderController::class, 'index']);
            Route::get('/orders/{order}', [OrderController::class, 'show']);
            Route::post('/orders/checkout', [OrderController::class, 'checkout']);
            Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

            Route::get('/transactions', [TransactionController::class, 'index']);
            Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

            Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        });

        // Admin Only Access
        Route::middleware('role:admin')->group(function () {
            // Staff Management
            Route::apiResource('staff', StaffController::class);

            // Category & Product Mutations
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);

            // Inventory
            Route::get('/inventory', [InventoryController::class, 'index']);
            Route::post('/inventory/{id}/restock', [InventoryController::class, 'restock']);

            // Analytics & Settings
            Route::get('/analytics/reports', [AnalyticsController::class, 'reports']);
            Route::get('/settings', [SettingsController::class, 'index']);
            Route::put('/settings', [SettingsController::class, 'update']);
        });
    });
});
