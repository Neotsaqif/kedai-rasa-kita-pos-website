<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    public function test_cashier_cannot_access_staff_management(): void
    {
        $cashier = new User([
            'id' => 2,
            'name' => 'Cashier User',
            'email' => 'cashier@example.com',
            'role' => 'cashier',
            'is_active' => true,
        ]);

        Sanctum::actingAs($cashier);

        $response = $this->getJson('/api/v1/staff');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'This action is unauthorized for your role',
            ]);
    }
}
