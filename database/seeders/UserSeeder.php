<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table with test users.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'finaltest@example.com'],
            [
                'name' => 'Final Test',
                'password' => bcrypt('test123'),
                'role' => 'customer',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password123'),
                'role' => 'admin',
            ]
        );
    }
}
