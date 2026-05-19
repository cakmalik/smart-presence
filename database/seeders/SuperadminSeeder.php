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
            ['email' => 's@s.s'],
            [
                'name' => 'Superadmin',
                'username' => 'superadmin',
                'password' => Hash::make('123'),
            ]
        );

        $superadmin->assignRole('superadmin');
    }
}
