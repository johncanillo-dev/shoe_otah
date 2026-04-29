<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Clear existing users
User::truncate();

// Create test users
User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'email_verified_at' => now(),
    'password' => bcrypt('password'),
]);

User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'email_verified_at' => now(),
    'password' => bcrypt('password'),
]);

User::create([
    'name' => 'Jane Smith',
    'email' => 'jane@example.com',
    'email_verified_at' => now(),
    'password' => bcrypt('password'),
]);

echo "✓ Users seeded successfully!\n";
echo "  - test@example.com (password: password)\n";
echo "  - john@example.com (password: password)\n";
echo "  - jane@example.com (password: password)\n";
