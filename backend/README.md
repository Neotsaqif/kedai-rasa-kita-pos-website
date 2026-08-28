# Kedai Rasa Kita POS - Backend API

REST API backend for **Kedai Rasa Kita POS** built with Laravel 11, Sanctum, and PostgreSQL (Supabase).

## Architecture

```text
React (Frontend)
   ↓ HTTP / JSON
Laravel REST API
   ↓
Business Logic (Services)
   ↓
Supabase PostgreSQL
```

## Backend Structure

```text
app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── AuthController.php
│   │   ├── StaffController.php
│   │   ├── CategoryController.php
│   │   ├── ProductController.php
│   │   ├── InventoryController.php
│   │   ├── OrderController.php
│   │   ├── TransactionController.php
│   │   ├── DashboardController.php
│   │   ├── AnalyticsController.php
│   │   ├── SettingsController.php
│   │   └── HealthController.php
│   ├── Requests/
│   │   ├── LoginRequest.php
│   │   ├── StoreStaffRequest.php
│   │   ├── StoreCategoryRequest.php
│   │   ├── StoreProductRequest.php
│   │   ├── UpdateProductRequest.php
│   │   ├── UpdateInventoryRequest.php
│   │   ├── CheckoutRequest.php
│   │   └── CancelOrderRequest.php
│   ├── Resources/
│   │   ├── UserResource.php
│   │   ├── StaffResource.php
│   │   ├── CategoryResource.php
│   │   ├── ProductResource.php
│   │   ├── InventoryResource.php
│   │   ├── OrderResource.php
│   │   ├── TransactionResource.php
│   │   └── PaymentResource.php
│   └── Middleware/
│       └── CheckRole.php
├── Models/
│   └── User.php
├── Services/
│   ├── CheckoutService.php
│   ├── InventoryService.php
│   ├── CancellationService.php
│   └── ReceiptService.php
└── Traits/
    └── ApiResponse.php
```

## API Modules & Endpoints (`/api/v1`)

### Public Endpoints
- `GET  /api/v1/health` - Health check
- `POST /api/v1/auth/login` - User login

### Protected Endpoints (`auth:sanctum`)

#### Shared (Admin & Cashier)
- `POST /api/v1/auth/logout`
- `GET  /api/v1/auth/me`
- `GET  /api/v1/categories` & `GET /api/v1/categories/{id}`
- `GET  /api/v1/products` & `GET /api/v1/products/{id}`
- `GET  /api/v1/orders` & `GET /api/v1/orders/{id}`
- `POST /api/v1/orders/checkout`
- `POST /api/v1/orders/{id}/cancel`
- `GET  /api/v1/transactions` & `GET /api/v1/transactions/{id}`
- `GET  /api/v1/dashboard/summary`

#### Admin Only (`role:admin`)
- `GET|POST|PUT|DELETE /api/v1/staff`
- `POST|PUT|DELETE /api/v1/categories`
- `POST|PUT|DELETE /api/v1/products`
- `GET  /api/v1/inventory`
- `POST /api/v1/inventory/{id}/restock`
- `GET  /api/v1/analytics/reports`
- `GET|PUT /api/v1/settings`

## Standard JSON Response Format

### Success Response (`200 OK`, `201 Created`)
```json
{
    "success": true,
    "message": "Product created successfully.",
    "data": {}
}
```

### Error Response (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
    "success": false,
    "message": "The given data was invalid",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

## Development Rules

1. **Keep Controllers Thin**: Controllers delegate validation to Form Requests and complex operations to Services.
2. **Business Logic in Services**: Complex operations (like checkout, stock deduction) reside in `app/Services/`.
3. **Form Request Validation**: All incoming payload validations are defined in `app/Http/Requests/`.
4. **API Resources for Serialization**: All responses utilize `app/Http/Resources/` to avoid exposing models blindly.
5. **Server-Side Authorization**: Enforce role checks on backend (`CheckRole` middleware).
6. **No Direct DB Access from Frontend**: React must only consume the Laravel REST API.

## Testing & Execution

Run development server:
```bash
php artisan serve
```

Run test suite:
```bash
php artisan test --filter=Api
```
