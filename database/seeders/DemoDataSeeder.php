<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::firstOrCreate(
            ['code' => 'smala'],
            [
                'name' => 'SMALA',
                'address' => 'smala',
                'phone' => '123123',
                'email' => 'smala@s.s',
                'status' => 'active',
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'smaaaala@s.s'],
            [
                'name' => 'admin-smala',
                'username' => 'smala',
                'password' => Hash::make('123'),
                'school_id' => $school->id,
            ]
        );
        $admin->assignRole('admin');

        $classroom = Classroom::firstOrCreate(
            ['school_id' => $school->id, 'name' => 'X-A'],
            [
                'grade' => 'X',
            ]
        );

        Student::updateOrCreate(
            ['nis' => '123123121'],
            [
                'school_id' => $school->id,
                'classroom_id' => $classroom->id,
                'nisn' => '132415',
                'name' => 'Malik',
                'qr_code' => '08f754fd-124e-4dd3-984a-4bf6c770931e',
                'status' => 'active',
            ]
        );
    }
}
