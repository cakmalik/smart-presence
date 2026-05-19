<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@smartpresence.id'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
            ]
        );

        $superadmin->assignRole('superadmin');
    }
}
