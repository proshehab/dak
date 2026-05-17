<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_user_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'demo@example.com',
        ]);
    }

    public function test_it_logs_in_a_user_and_returns_a_token(): void
    {
        User::factory()->create([
            'email' => 'demo@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'demo@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email'],
            ]);
    }

    public function test_it_updates_the_authenticated_users_name(): void
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'demo@example.com',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/profile', [
                'name' => 'New Name',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.name', 'New Name')
            ->assertJsonPath('user.email', 'demo@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'email' => 'demo@example.com',
        ]);
    }
}
