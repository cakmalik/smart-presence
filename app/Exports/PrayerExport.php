<?php

namespace App\Exports;

use App\Exports\Sheets\PrayerPerClassroomSheet;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Student;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class PrayerExport implements WithMultipleSheets
{
    use Exportable;

    public function __construct(
        private int $schoolId,
        private string $dateFrom,
        private string $dateTo,
        private ?string $prayerType,
        private array $prayerTypes,
        private string $filter = 'all',
    ) {}

    public function sheets(): array
    {
        $classrooms = Classroom::query()
            ->where('school_id', $this->schoolId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sheets = [];
        foreach ($classrooms as $classroom) {
            $students = Student::query()
                ->where('classroom_id', $classroom->id)
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'nis']);

            if ($students->isEmpty()) {
                continue;
            }

            $attendances = Attendance::query()
                ->whereIn('attendance_type', $this->prayerTypes)
                ->whereIn('student_id', $students->pluck('id'))
                ->where('attendance_date', '>=', $this->dateFrom)
                ->where('attendance_date', '<=', $this->dateTo)
                ->when($this->prayerType, fn ($q) => $q->where('attendance_type', $this->prayerType))
                ->get(['student_id', 'attendance_date']);

            $attendedIds = $attendances->pluck('student_id')->unique()->toArray();

            if ($this->filter === 'present') {
                $students = $students->whereIn('id', $attendedIds)->values();
            } elseif ($this->filter === 'absent') {
                $students = $students->whereNotIn('id', $attendedIds)->values();
            }

            if ($students->isEmpty()) {
                continue;
            }

            $attendedMap = [];
            foreach ($attendances as $att) {
                $dateKey = $att->attendance_date->format('Y-m-d');
                $attendedMap[$att->student_id][$dateKey] = true;
            }

            $sheets[] = new PrayerPerClassroomSheet(
                classroom: $classroom,
                students: $students,
                dateFrom: $this->dateFrom,
                dateTo: $this->dateTo,
                attendedMap: $attendedMap,
            );
        }

        return $sheets;
    }
}
