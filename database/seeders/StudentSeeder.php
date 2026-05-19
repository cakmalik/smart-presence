<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $school1 = School::firstOrCreate(
            ['code' => 'smala'],
            [
                'name' => 'SMALA',
                'address' => 'Jl. Pendidikan No. 1',
                'phone' => '081234567890',
                'email' => 'smala@sch.id',
                'status' => 'active',
            ]
        );

        $school2 = School::firstOrCreate(
            ['code' => 'smalb'],
            [
                'name' => 'SMALB',
                'address' => 'Jl. Merdeka No. 10',
                'phone' => '081234567891',
                'email' => 'smalb@sch.id',
                'status' => 'active',
            ]
        );

        $classroom1 = Classroom::firstOrCreate(
            ['school_id' => $school1->id, 'name' => 'X-A'],
            ['grade' => 'X']
        );

        $classroom2 = Classroom::firstOrCreate(
            ['school_id' => $school1->id, 'name' => 'X-B'],
            ['grade' => 'X']
        );

        $classroom3 = Classroom::firstOrCreate(
            ['school_id' => $school2->id, 'name' => 'XI-A'],
            ['grade' => 'XI']
        );

        $classroom4 = Classroom::firstOrCreate(
            ['school_id' => $school2->id, 'name' => 'XI-B'],
            ['grade' => 'XI']
        );

        $classrooms = [$classroom1, $classroom2, $classroom3, $classroom4];

        $firstNames = [
            'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hana',
            'Irfan', 'Joko', 'Kartika', 'Lestari', 'Mulyadi', 'Nurul', 'Oscar',
            'Putri', 'Qomar', 'Rina', 'Sigit', 'Tina', 'Umar', 'Vina', 'Wawan',
            'Yanti', 'Zainal', 'Adi', 'Bayu', 'Cahya', 'Dian', 'Edi', 'Fajar',
            'Gita', 'Hendra', 'Indah', 'Jati', 'Kurnia', 'Lina', 'Mega', 'Nanda',
            'Oktavia', 'Prasetyo', 'Ratna', 'Sari', 'Tri', 'Utami', 'Vera',
            'Wahyu', 'Yoga', 'Zahra', 'Agus', 'Bambang', 'Cici', 'Deni',
        ];

        $lastNames = [
            'Pratama', 'Wijaya', 'Kusuma', 'Utami', 'Santoso', 'Saputra',
            'Hidayat', 'Nugroho', 'Wulandari', 'Purnama', 'Rahayu', 'Setiawan',
            'Susanti', 'Handayani', 'Mariana', 'Permadi', 'Ramadhan',
            'Anggraeni', 'Firmansyah', 'Irawan', 'Lestari', 'Maulana',
            'Ningsih', 'Pertiwi', 'Sari', 'Wahyuni',
        ];

        $students = [];
        for ($i = 0; $i < 50; $i++) {
            $classroom = $classrooms[$i % 4];
            $school = $classroom->school_id === $school1->id ? $school1 : $school2;

            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName.' '.$lastName;

            $students[] = [
                'school_id' => $school->id,
                'classroom_id' => $classroom->id,
                'nis' => '24'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'nisn' => '00'.str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                'name' => $name,
                'qr_code' => Str::uuid()->toString(),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach ($students as $student) {
            Student::create($student);
        }

        $this->command->info('50 siswa berhasil dibuat untuk 2 sekolah (masing-masing 2 kelas).');
    }
}
