<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@example.com',
                'password' => '123',
                'access_type' => 'admin',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Organizator',
                'email' => 'organizer@example.com',
                'password' => '123',
                'access_type' => 'organizer',
                'email_verified_at' => now()
            ],
            [
                'name' => 'Użytkownik',
                'email' => 'user@example.com',
                'password' => '123',
                'access_type' => 'user',
                'email_verified_at' => now()
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}